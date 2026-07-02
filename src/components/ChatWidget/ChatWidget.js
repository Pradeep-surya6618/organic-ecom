import React, { useState, useEffect, useRef } from "react";
import { Bot, X, Send, Leaf, ShoppingCart, Heart, ArrowRight, Mic, MicOff, ThumbsUp, ThumbsDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useProducts } from "../../context/ProductContext";
import { chatAPI, orderAPI, recipeAPI, streamChat } from "../../services/api";

const ORDER_STATUS_LABEL = {
  pending: "⏳ Pending",
  confirmed: "✅ Confirmed",
  processing: "🔧 Being packed",
  packed: "📦 Packed",
  out_for_delivery: "🚚 Out for delivery",
  delivered: "🎉 Delivered",
  cancelled: "❌ Cancelled",
};

export default function ChatWidget() {
  const { visibleProducts: products } = useProducts();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi there! 🌿 I'm your AI Store Assistant. I can find products, add them to your cart or wishlist, suggest recipes and add their ingredients, track your orders, reorder your last order, and answer any questions about the store. Try 'recipe with spinach', 'add 2 apples to cart', 'track my order', or 'what's good for a healthy breakfast?'. You can also rate my answers with 👍/👎 to help me improve!"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const messagesEndRef = useRef(null);

  const navigate = useNavigate();
  const { cart, items, addToCart, removeFromCart, clearCart, placeOrder, total } = useCart();
  const { toggleWishlist, isWishlisted, clearWishlist } = useWishlist();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Load recipes once so the bot can suggest them and add their ingredients to the cart.
  useEffect(() => {
    let alive = true;
    recipeAPI.getAll()
      .then((res) => { if (alive) setRecipes(res?.data || []); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  // Match a recipe's ingredients to store products and add the available ones to the cart.
  const addRecipeIngredients = (recipe) => {
    const ingredients = recipe.ingredients || [];
    const added = [];
    const missing = [];
    ingredients.forEach((ing) => {
      const name = (ing.name || "").trim();
      if (!name) return;
      const product = findProduct(name);
      if (product) {
        addToCart(product, 1);
        added.push(product.name);
      } else {
        missing.push(name);
      }
    });
    let text = added.length
      ? `🧺 Added ${added.length} ingredient(s) for **${recipe.title}** to your cart:\n${added.map((n) => `• ${n}`).join("\n")}`
      : `I couldn't match any ingredients for **${recipe.title}** to our current products.`;
    if (missing.length) text += `\n\n⚠️ Not stocked right now: ${missing.join(", ")}`;
    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text,
        actions: added.length
          ? [
              { label: "View Cart 🛒", action: "go to cart" },
              { label: "Checkout 💳", action: "go to checkout" },
            ]
          : [{ label: "Browse shop 🌾", action: "go to shop" }],
      },
    ]);
  };

  const findProduct = (nameQuery) => {
    if (!nameQuery) return null;
    const query = nameQuery.toLowerCase().trim();
    // Try exact match first
    let match = products.find((p) => p.name.toLowerCase() === query);
    if (match) return match;
    // Try starts with
    match = products.find((p) => p.name.toLowerCase().startsWith(query));
    if (match) return match;
    // Try contains
    match = products.find((p) => p.name.toLowerCase().includes(query));
    if (match) return match;
    // Try checking if query contains product name
    match = products.find((p) => query.includes(p.name.toLowerCase()));
    return match;
  };

  const handleListen = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please try Chrome or Safari!");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onerror = (e) => {
      console.error(e);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      handleSend(transcript);
    };

    recognition.start();
  };

  // Update the trailing streaming bot bubble as tokens arrive.
  const updateStreamingText = (fullText) => {
    setMessages((prev) => {
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (last && last.streaming) copy[copy.length - 1] = { ...last, text: fullText };
      return copy;
    });
  };

  // Ask the backend AI brain (streamed) for anything the rule parser doesn't handle.
  const askAI = async (text) => {
    setIsTyping(true);
    let acc = "";
    let started = false;
    try {
      await streamChat(text, (delta) => {
        acc += delta;
        if (!started) {
          started = true;
          setIsTyping(false);
          setMessages((prev) => [...prev, { sender: "bot", ai: true, streaming: true, text: acc }]);
        } else {
          updateStreamingText(acc);
        }
      });
      if (!started) throw new Error("empty stream");
      // finalize
      setMessages((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last && last.streaming) copy[copy.length - 1] = { ...last, streaming: false };
        return copy;
      });
    } catch (streamErr) {
      // Fall back to the non-streaming endpoint, then to a friendly message.
      try {
        const res = await chatAPI.send(text);
        const reply = res?.data?.message || res?.message || "I'm not sure how to help with that yet.";
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last && last.streaming) { copy[copy.length - 1] = { ...last, streaming: false, ai: true, text: reply }; return copy; }
          return [...copy, { sender: "bot", ai: true, text: reply }];
        });
      } catch (err) {
        const msg = "I'm having trouble reaching my AI brain right now. You can still say things like 'search honey', 'add 2 bananas to cart', or 'go to shop'. 🌿";
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last && last.streaming) { copy[copy.length - 1] = { ...last, streaming: false, text: msg }; return copy; }
          return [...copy, { sender: "bot", text: msg }];
        });
      }
    } finally {
      setIsTyping(false);
    }
  };

  // Send thumbs up/down feedback on an AI answer.
  const sendFeedback = (msgIndex, rating) => {
    const botMsg = messages[msgIndex];
    if (!botMsg || botMsg.rated) return;
    const userMsg = messages.slice(0, msgIndex).reverse().find((m) => m.sender === "user");
    chatAPI.feedback({ rating, botMessage: botMsg.text, userMessage: userMsg?.text || "" }).catch(() => {});
    setMessages((prev) => prev.map((m, i) => (i === msgIndex ? { ...m, rated: rating } : m)));
  };

  // Live order tracking — uses the real orders API.
  const trackOrders = async (orderNumber) => {
    setIsTyping(true);
    try {
      if (orderNumber) {
        const res = await orderAPI.getOrder(orderNumber);
        const o = res?.data?.data || res?.data;
        if (!o || !o.orderNumber) {
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: `I couldn't find order **${orderNumber}**. Please check the number and try again.` },
          ]);
        } else {
          const eta = o.estimatedDelivery ? ` · ETA ${new Date(o.estimatedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : "";
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `📦 **${o.orderNumber}**\nStatus: ${ORDER_STATUS_LABEL[o.status] || o.status}\nTotal: ₹${o.pricing?.total?.toFixed(2) ?? "—"} · ${o.items?.length || 0} item(s)${eta}`,
              actions: [{ label: "View orders 📦", action: "go to account" }],
            },
          ]);
        }
      } else {
        const res = await orderAPI.getMyOrders();
        const list = res?.data?.orders || res?.orders || res?.data || [];
        if (!list.length) {
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: "You don't have any orders yet. Browse the shop to place your first one! 🛍️", actions: [{ label: "Go to shop 🌾", action: "go to shop" }] },
          ]);
        } else {
          const lines = list.slice(0, 3).map((o) => `📦 **${o.orderNumber}** — ${ORDER_STATUS_LABEL[o.status] || o.status} · ₹${o.pricing?.total?.toFixed(2) ?? "—"}`).join("\n");
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `Here are your recent orders:\n\n${lines}\n\nSay "track ORD…" for a specific one, or "reorder" to buy your last order again.`,
              actions: [{ label: "View all orders 📦", action: "go to account" }],
            },
          ]);
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "I couldn't fetch your orders — please make sure you're signed in. 🔐" },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Reorder — re-add every item from the customer's most recent order to the cart.
  const reorderLast = async () => {
    setIsTyping(true);
    try {
      const res = await orderAPI.getMyOrders();
      const list = res?.data?.orders || res?.orders || res?.data || [];
      if (!list.length) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "You have no past orders to reorder yet. Let's find something fresh! 🌾", actions: [{ label: "Go to shop", action: "go to shop" }] },
        ]);
        return;
      }
      const last = list[0]; // API returns newest first
      const orderItems = last.items || [];
      let count = 0;
      orderItems.forEach((it) => {
        const match =
          products.find((p) => p.name?.toLowerCase() === (it.name || "").toLowerCase()) ||
          { id: it.product || it.name, name: it.name, price: it.price, image: it.image, category: "" };
        const qty = it.quantity || 1;
        addToCart(match, qty);
        count += qty;
      });
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `🔁 Re-added ${count} item(s) from **${last.orderNumber}** to your cart!`,
          actions: [
            { label: "View Cart 🛒", action: "go to cart" },
            { label: "Checkout 💳", action: "go to checkout" },
          ],
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "I couldn't load your past orders — please make sure you're signed in. 🔐" },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (textToSend) => {
    const msgText = textToSend || input;
    if (!msgText.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: "user", text: msgText }]);
    if (!textToSend) setInput("");

    setIsTyping(true);

    // Simulate bot parsing after a brief timeout
    setTimeout(() => {
      setIsTyping(false);
      const lower = msgText.toLowerCase().trim();

      // Check if we have a pending product request awaiting quantity selection
      if (pendingProduct) {
        if (lower === "cancel" || lower.includes("cancel")) {
          setPendingProduct(null);
          return setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "Cancelled add to cart. Let me know if you need anything else! 😊"
            }
          ]);
        }
        const qty = parseInt(lower, 10);
        if (!isNaN(qty) && qty > 0) {
          const product = pendingProduct;
          addToCart(product, qty);
          setPendingProduct(null);
          return setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `Successfully added ${qty}x **${product.name}** (₹${product.price.toFixed(2)} each) to your cart! 🛒`,
              actions: [
                { label: "Add More ➕", action: `add ${qty} ${product.name} to cart` },
                { label: "View Cart 🛒", action: "go to cart" },
                { label: "Checkout 💳", action: "go to checkout" }
              ]
            }
          ]);
        }
        // If they entered something else, cancel pending product and handle as a normal command
        setPendingProduct(null);
      }

      // 0a. Reorder — buy the last order again (checked before the add/buy/order parser)
      if (
        lower === "reorder" ||
        lower.includes("order again") ||
        lower.includes("reorder") ||
        lower.includes("buy my last order") ||
        lower.includes("repeat my order") ||
        lower.includes("repeat order") ||
        lower.includes("same as last")
      ) {
        reorderLast();
        return;
      }

      // 0b. Order tracking — by number ("track ORD…") or the latest orders
      const orderNoMatch = msgText.match(/\bORD\d+/i);
      if (
        orderNoMatch ||
        lower.includes("track") ||
        lower.includes("where is my order") ||
        lower.includes("where's my order") ||
        lower.includes("order status") ||
        lower === "my orders" ||
        lower === "my order"
      ) {
        trackOrders(orderNoMatch ? orderNoMatch[0].toUpperCase() : null);
        return;
      }

      // 1. Navigation Page Commands
      if (
        lower === "cart" ||
        lower === "go to cart" ||
        lower === "show cart" ||
        lower === "view cart"
      ) {
        navigate("/cart");
        return setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Opening your shopping cart! 🛒" }
        ]);
      }
      if (
        lower === "checkout" ||
        lower === "go to checkout" ||
        lower === "proceed to checkout"
      ) {
        navigate("/checkout");
        return setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Proceeding to checkout page! 💳" }
        ]);
      }
      if (
        lower === "wishlist" ||
        lower === "go to wishlist" ||
        lower === "show wishlist" ||
        lower === "view wishlist"
      ) {
        navigate("/wishlist");
        return setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Showing your wishlist! ❤️" }
        ]);
      }
      if (
        lower === "shop" ||
        lower === "go to shop" ||
        lower === "show products" ||
        lower === "store" ||
        lower === "browse"
      ) {
        navigate("/shop");
        return setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Navigating to our shop. Browse our fresh products! 🌾" }
        ]);
      }
      if (
        lower === "recipes" ||
        lower === "go to recipes" ||
        lower === "show recipes"
      ) {
        navigate("/recipes");
        return setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Opening our healthy recipes page! 🥗" }
        ]);
      }
      if (
        lower === "account" ||
        lower === "go to account" ||
        lower === "show orders" ||
        lower === "orders"
      ) {
        navigate("/account");
        return setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Going to your Account & Order history page. 📦" }
        ]);
      }

      // 1.5 Recipe ideas + add-ingredients-to-cart
      let recipeKw = null;
      const rkw =
        lower.match(/(?:recipe|cook|make|dish|meal)[a-z\s]*?(?:with|using|from|containing)\s+(.+)$/i) ||
        lower.match(/what can i (?:cook|make|prepare)(?:\s+with)?\s+(.+)$/i);
      if (rkw) recipeKw = rkw[1].replace(/[?.!]+$/, "").trim();
      const recipeIntent =
        recipeKw ||
        lower.includes("recipe") ||
        lower.includes("what to cook") ||
        lower.includes("cooking idea") ||
        lower.includes("dinner idea") ||
        lower.includes("meal idea") ||
        lower.includes("something to cook");
      if (recipeIntent && recipes.length > 0) {
        const matches = recipeKw
          ? recipes.filter(
              (r) =>
                (r.title || "").toLowerCase().includes(recipeKw) ||
                (r.description || "").toLowerCase().includes(recipeKw) ||
                (r.ingredients || []).some(
                  (i) =>
                    (i.name || "").toLowerCase().includes(recipeKw) ||
                    recipeKw.includes((i.name || "").toLowerCase())
                )
            )
          : recipes;
        if (matches.length > 0) {
          return setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: recipeKw
                ? `Here ${matches.length === 1 ? "is a recipe" : "are recipes"} you can make with ${recipeKw} 🥗 — tap the 🛒 to add the ingredients:`
                : `Here are some recipe ideas 🥗 — tap the 🛒 to add the ingredients to your cart:`,
              recipes: matches.slice(0, 3),
            },
          ]);
        }
        return setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: recipeKw
              ? `I don't have a saved recipe with "${recipeKw}" yet — browse all our recipes for ideas!`
              : `Browse our recipes page for fresh ideas!`,
            actions: [{ label: "Open recipes 🥗", action: "go to recipes" }],
          },
        ]);
      }

      // 2. Checkout / Place Order Direct Command
      if (
        lower === "place order" ||
        lower === "buy all" ||
        lower === "complete order" ||
        lower === "place my order"
      ) {
        const cartItems = items || cart || [];
        if (cartItems.length === 0) {
          return setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "Your cart is empty. Please add some products before checking out! 🛍️"
            }
          ]);
        }
        placeOrder(total);
        navigate("/account");
        return setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: `✓ Order placed successfully! Thank you for shopping with Organic Store. Your total is ₹${total.toFixed(
              2
            )}. I've navigated you to your Account page to track your order. 📦`
          }
        ]);
      }

      // 3. Clear Cart / Wishlist
      if (lower === "clear cart" || lower === "empty cart") {
        clearCart();
        return setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Your shopping cart has been cleared! 🛒" }
        ]);
      }
      if (lower === "clear wishlist" || lower === "empty wishlist") {
        clearWishlist();
        return setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Your wishlist has been cleared! ❤️" }
        ]);
      }

      // 4. Wishlist add command
      let wishlistMatch =
        lower.match(/^(?:add\s+)?(.*?)\s+to\s+wishlist$/i) ||
        lower.match(/^wishlist\s+(.*?)$/i) ||
        lower.match(/^save\s+(.*?)\s+to\s+wishlist$/i);
      if (wishlistMatch) {
        const prodName = wishlistMatch[1].trim();
        if (prodName && prodName !== "page" && prodName !== "show") {
          const product = findProduct(prodName);
          if (product) {
            if (!isWishlisted(product.id)) {
              toggleWishlist(product);
            }
            return setMessages((prev) => [
              ...prev,
              {
                sender: "bot",
                text: `Added **${product.name}** to your wishlist! ❤️`,
                actions: [{ label: "View Wishlist", action: "go to wishlist" }]
              }
            ]);
          }
        }
      }

      // 5. Remove from Cart command
      let removeMatch =
        lower.match(/^(?:remove|delete|discard)\s+(.*?)(?:\s+from\s+cart)?$/i);
      if (removeMatch) {
        const prodName = removeMatch[1].trim();
        if (prodName) {
          const cartItemsList = items || cart || [];
          const cartProduct = cartItemsList.find(
            (item) =>
              item.name.toLowerCase().includes(prodName) ||
              prodName.includes(item.name.toLowerCase())
          );
          if (cartProduct) {
            removeFromCart(cartProduct.id);
            return setMessages((prev) => [
              ...prev,
              { sender: "bot", text: `Removed **${cartProduct.name}** from your cart. 🗑` }
            ]);
          } else {
            return setMessages((prev) => [
              ...prev,
              { sender: "bot", text: `I couldn't find "${prodName}" in your cart.` }
            ]);
          }
        }
      }

      // 6. Add to Cart / Order action
      let addMatch = lower.match(
        /^(?:add|buy|order)\s+(?:(\d+)\s+)?(.*?)(?:\s+to\s+cart)?$/i
      );
      if (addMatch) {
        // eslint-disable-next-line no-unused-vars
        const quantity = addMatch[1] ? parseInt(addMatch[1], 10) : 1;
        const prodName = addMatch[2].trim();

        if (
          prodName &&
          prodName !== "cart" &&
          prodName !== "wishlist" &&
          prodName !== "page" &&
          prodName !== "order" &&
          prodName !== "checkout"
        ) {
          const product = findProduct(prodName);
          if (product) {
            setPendingProduct(product);
            return setMessages((prev) => [
              ...prev,
              {
                sender: "bot",
                text: `🌿 **Product Details for ${product.name}:**\n• **Price:** ₹${product.price.toFixed(2)}\n• **Category:** ${product.category}\n• **Weight:** ${product.weight || "N/A"}\n• **Rating:** ⭐ ${product.rating} (${product.reviews} reviews)\n• **Description:** ${product.description}\n• **Tags:** ${product.tags ? product.tags.join(", ") : "None"}\n\n**How many would you like to add to your cart?** Please select or enter a quantity below:`,
                actions: [
                  { label: "1", action: "1" },
                  { label: "2", action: "2" },
                  { label: "3", action: "3" },
                  { label: "5", action: "5" },
                  { label: "Cancel ❌", action: "cancel" }
                ]
              }
            ]);
          } else {
            const suggestions = products
              .filter(
                (p) =>
                  p.name.toLowerCase().includes(prodName.split(" ")[0]) ||
                  p.category.toLowerCase().includes(prodName)
              )
              .slice(0, 3);
            return setMessages((prev) => [
              ...prev,
              {
                sender: "bot",
                text: `Sorry, I couldn't find a product matching "${prodName}". Did you mean one of these?`,
                products: suggestions.length > 0 ? suggestions : products.slice(0, 3)
              }
            ]);
          }
        }
      }

      // 6.5 Product Details / Info Command
      let detailsMatch = lower.match(/^(?:details\s+of|info\s+about|about|tell\s+me\s+about|show\s+details\s+for|view\s+details\s+for)\s+(.*?)$/i);
      if (detailsMatch) {
        const prodName = detailsMatch[1].trim();
        if (prodName) {
          const product = findProduct(prodName);
          if (product) {
            return setMessages((prev) => [
              ...prev,
              {
                sender: "bot",
                text: `🌿 **Product Details for ${product.name}:**\n• **Price:** ₹${product.price.toFixed(2)}\n• **Category:** ${product.category}\n• **Weight:** ${product.weight || "N/A"}\n• **Rating:** ⭐ ${product.rating} (${product.reviews} reviews)\n• **Description:** ${product.description}\n• **Tags:** ${product.tags ? product.tags.join(", ") : "None"}`,
                actions: [
                  { label: `Add to Cart 🛒`, action: `add ${product.name} to cart` },
                  { label: "View Cart 🛒", action: "go to cart" }
                ]
              }
            ]);
          }
        }
      }

      // 7. Search / Enquiry
      if (
        lower.includes("search") ||
        lower.includes("find") ||
        lower.includes("do you have") ||
        lower.includes("show me") ||
        lower.includes("looking for") ||
        lower.startsWith("have ")
      ) {
        const query = lower
          .replace(/^(search|find|do you have|show me|looking for|have)\s+/, "")
          .trim();
        const matched = products.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query) ||
            p.tags.some((t) => t.toLowerCase().includes(query))
        );
        if (matched.length > 0) {
          return setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `Here is what I found for "${query}":`,
              products: matched.slice(0, 3)
            }
          ]);
        } else {
          return setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: `I couldn't find any products matching "${query}". Try searching for fruits, vegetables, or herbs! 🥕`
            }
          ]);
        }
      }

      // 8. New pages navigation
      if (lower === "go to reviews page direct") {
        navigate("/reviews");
        return setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Opening the Customer Reviews page! 💬" }
        ]);
      }
      if (lower === "cancel reviews redirection") {
        return setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "No problem! Let me know if there's anything else I can help you with. 😊" }
        ]);
      }
      if (lower.includes("review") || lower.includes("testimonial")) {
        return setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Would you like me to take you to the Customer Reviews section?",
            actions: [
              { label: "Yes, take me there! 👍", action: "go to reviews page direct" },
              { label: "No, thank you ❌", action: "cancel reviews redirection" }
            ]
          }
        ]);
      }
      if (
        lower.includes("list product") ||
        lower.includes("show products") ||
        lower.includes("what products") ||
        lower.includes("what do you have") ||
        lower.includes("all products") ||
        lower.includes("list the products") ||
        lower.includes("available products") ||
        lower.includes("what items")
      ) {
        const prodList = products.map(p => `• **${p.name}** (₹${p.price.toFixed(2)})`).join("\n");
        return setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: `🌿 **Here are the fresh organic products available at Organic Store:**\n\n${prodList}\n\nWhich one would you like to know more about or add to your cart?`,
            products: products.slice(0, 6)
          }
        ]);
      }
      if (lower.includes("about") || lower.includes("story") || lower.includes("promise") || lower.includes("who are you")) {
        navigate("/about");
        return setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Opening our About Us page to learn more about our organic farm-to-door promise! 🌿" }
        ]);
      }
      if (lower.includes("contact") || lower.includes("support") || lower.includes("help") || lower.includes("reach out") || lower.includes("email") || lower.includes("phone") || lower.includes("call")) {
        navigate("/contact");
        return setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Opening our Contact Us page. We're here to help! 📞" }
        ]);
      }

      // 9. FAQ / Smart Answers
      if (lower.includes("delivery") || lower.includes("how fast") || lower.includes("time")) {
        return setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "🚚 **Delivery Promise:** We deliver fresh organic produce to your neighborhood in **10 minutes**! Operating hours are 7am – 11pm." }
        ]);
      }
      if (lower.includes("refund") || lower.includes("return") || lower.includes("guarantee")) {
        return setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "🛡️ **Freshness Guarantee:** We guarantee the freshness of all items. If you are not satisfied, we offer easy, no-questions-asked refunds!" }
        ]);
      }
      if (lower.includes("payment") || lower.includes("pay") || lower.includes("razorpay")) {
        return setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "💳 **Secure Payments:** We support cards, UPI, and net banking using fully integrated, secure Razorpay checkout." }
        ]);
      }
      if (lower.includes("admin") || lower.includes("portal") || lower.includes("dashboard")) {
        return setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "⚙️ **Admin Access:** You can access the Admin Center dashboard by navigating to `/admin/login` or choosing it from the profile menu." }
        ]);
      }

      // Default → hand off to the AI brain for natural-language questions
      askAI(msgText);
    }, 1000);
  };

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-6 z-50 font-sans">
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#153d2b] text-white shadow-xl hover:bg-emerald-800 hover:scale-105 active:scale-95 transition-all duration-250 cursor-pointer"
        >
          <Bot size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[340px] sm:w-[380px] h-[520px] rounded-3xl border border-stone-200 bg-white shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-[#153d2b] px-5 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                <Leaf size={16} className="text-lime-300" />
              </span>
              <div>
                <h3 className="font-extrabold text-sm leading-none">Organic Store AI</h3>
                <p className="text-[10px] text-emerald-200/80 font-bold mt-1">Smart Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fbfcf9]">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs font-bold leading-relaxed whitespace-pre-line ${
                    msg.sender === "user"
                      ? "bg-[#153d2b] text-white"
                      : "bg-stone-100 text-stone-800"
                  }`}
                >
                  {msg.text}

                  {/* Inline product cards (for search results/suggestions) */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.products.map((prod) => (
                        <div
                          key={prod.id}
                          className="flex items-center gap-2.5 p-2 bg-white border border-stone-200 rounded-xl"
                        >
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-10 h-10 object-cover rounded-lg shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black text-stone-900 truncate">
                              {prod.name}
                            </p>
                            <p className="text-[10px] text-emerald-700 font-bold">
                              ₹{prod.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setPendingProduct(prod);
                                setMessages((prev) => [
                                  ...prev,
                                  {
                                    sender: "bot",
                                    text: `🌿 **Product Details for ${prod.name}:**\n• **Price:** ₹${prod.price.toFixed(2)}\n• **Category:** ${prod.category}\n• **Weight:** ${prod.weight || "N/A"}\n• **Rating:** ⭐ ${prod.rating} (${prod.reviews} reviews)\n• **Description:** ${prod.description}\n• **Tags:** ${prod.tags ? prod.tags.join(", ") : "None"}\n\n**How many would you like to add to your cart?** Please select or enter a quantity:`,
                                    actions: [
                                      { label: "1", action: "1" },
                                      { label: "2", action: "2" },
                                      { label: "3", action: "3" },
                                      { label: "5", action: "5" },
                                      { label: "Cancel ❌", action: "cancel" }
                                    ]
                                  }
                                ]);
                              }}
                              className="p-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white rounded-lg transition"
                              title="Add to cart"
                            >
                              <ShoppingCart size={13} />
                            </button>
                            <button
                              onClick={() => {
                                if (!isWishlisted(prod.id)) {
                                  toggleWishlist(prod);
                                }
                                setMessages((prev) => [
                                  ...prev,
                                  {
                                    sender: "bot",
                                    text: `Added **${prod.name}** to wishlist! ❤️`,
                                    actions: [{ label: "View Wishlist", action: "go to wishlist" }]
                                  }
                                ]);
                              }}
                              className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition"
                              title="Add to wishlist"
                            >
                              <Heart
                                size={13}
                                className={isWishlisted(prod.id) ? "fill-current" : ""}
                              />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Inline recipe cards — tap the cart icon to add all ingredients */}
                  {msg.recipes && msg.recipes.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.recipes.map((r) => (
                        <div
                          key={r._id || r.title}
                          className="flex items-center gap-2.5 p-2 bg-white border border-stone-200 rounded-xl"
                        >
                          {r.imageUrl ? (
                            <img src={r.imageUrl} alt={r.title} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                          ) : (
                            <span className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 text-base">🥗</span>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black text-stone-900 truncate">{r.title}</p>
                            <p className="text-[10px] text-stone-400 font-bold truncate">
                              {[r.difficulty, r.prepTime, `${(r.ingredients || []).length} ingredients`].filter(Boolean).join(" · ")}
                            </p>
                          </div>
                          <button
                            onClick={() => addRecipeIngredients(r)}
                            className="p-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white rounded-lg transition shrink-0"
                            title="Add ingredients to cart"
                          >
                            <ShoppingCart size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Inline quick action buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {msg.actions.map((act, actIdx) => (
                        <button
                          key={actIdx}
                          onClick={() => handleSend(act.action)}
                          className="bg-white border border-stone-200 text-[#153d2b] hover:bg-emerald-50 rounded-lg px-2.5 py-1 text-[10px] font-black transition flex items-center gap-1 shadow-sm"
                        >
                          {act.label} <ArrowRight size={10} />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Feedback on AI answers (👍 / 👎) */}
                  {msg.sender === "bot" && msg.ai && !msg.streaming && (
                    msg.rated ? (
                      <div className="mt-2 text-[10px] font-bold text-stone-400">
                        Thanks for the feedback 🙏
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-stone-400">Helpful?</span>
                        <button
                          onClick={() => sendFeedback(index, "up")}
                          className="h-6 w-6 rounded-lg border border-stone-200 bg-white flex items-center justify-center text-stone-400 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 transition"
                          title="Helpful"
                        >
                          <ThumbsUp size={11} />
                        </button>
                        <button
                          onClick={() => sendFeedback(index, "down")}
                          className="h-6 w-6 rounded-lg border border-stone-200 bg-white flex items-center justify-center text-stone-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition"
                          title="Not helpful"
                        >
                          <ThumbsDown size={11} />
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start items-center">
                <div className="bg-stone-100 rounded-2xl px-4 py-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions chips */}
          <div className="p-3 bg-white border-t border-stone-100 flex gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            {(items.length > 0
              ? ["checkout", "track my order", "reorder", "clear cart"]
              : ["do you have honey?", "track my order", "reorder", "go to shop"]
            ).map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="shrink-0 bg-stone-50 border border-stone-200 text-stone-600 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 rounded-lg px-2.5 py-1.5 text-[10px] font-black transition cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-stone-200 bg-white flex items-center gap-2"
          >
            {/* Speech microphone button */}
            <button
              type="button"
              onClick={handleListen}
              className={`h-10 w-10 flex items-center justify-center rounded-xl transition active:scale-95 shrink-0 ${
                isListening
                  ? "bg-rose-500 text-white animate-pulse"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
              title={isListening ? "Listening..." : "Voice input"}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Type a command (e.g. 'order spinach')..."}
              disabled={isListening}
              className="flex-1 min-h-10 px-4 rounded-xl border border-stone-200 bg-stone-50 outline-none text-xs font-bold transition focus:border-emerald-500 focus:bg-white"
            />
            <button
              type="submit"
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#153d2b] text-white hover:bg-emerald-800 transition active:scale-95 shrink-0"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
