import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import {
  FaSearch,
  FaSort,
  FaTimes,
  FaLeaf,
} from "react-icons/fa";
import { useProducts } from "../context/ProductContext";
import ProductCard from "../components/ProductCard";

const Page = styled.div`
  background: #f8fafc;
  min-height: 100vh;
`;

const TopBar = styled.div`
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  /* Tighter padding on mobile */
  padding: 14px 16px;
  @media (min-width: 768px) {
    padding: 20px 40px;
  }
`;

const TopInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const PageTitle = styled.h1`
  margin: 0;
  /* Smaller on mobile */
  font-size: 1.3rem;
  font-weight: 900;
  color: #0f172a;
  @media (min-width: 640px) {
    font-size: 1.6rem;
  }
`;

const Count = styled.span`
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  @media (min-width: 640px) {
    font-size: 13px;
  }
`;

const SearchWrap = styled.div`
  position: relative;
  /* Full width below title on mobile */
  flex: 1;
  min-width: 0;
  max-width: 400px;
  @media (max-width: 768px) {
    max-width: 100%;
    order: 3;
    width: 100%;
    flex-basis: 100%;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 13px;
`;

const SearchInput = styled.input`
  width: 100%;
  /* 44px touch target on mobile */
  padding: 10px 12px 10px 36px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  outline: none;
  transition: border-color 0.2s;
  -webkit-appearance: none;
  &:focus {
    border-color: #16a34a;
  }
  &::placeholder {
    color: #94a3b8;
  }
  @media (min-width: 640px) {
    padding: 11px 14px 11px 40px;
  }
`;

const SortBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  /* Smaller font on mobile */
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
  @media (min-width: 640px) {
    font-size: 13px;
    padding: 10px 16px;
  }
  @media (hover: hover) {
    &:hover {
      border-color: #16a34a;
      color: #16a34a;
    }
  }
`;

const Layout = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  /* Full-width single column on mobile */
  padding: 12px 12px 48px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  @media (min-width: 900px) {
    grid-template-columns: 260px 1fr;
    gap: 28px;
    padding: 24px 40px 60px;
  }
`;

/* Sidebar hidden on mobile — filters surface via pill strip instead */
const Sidebar = styled.aside`
  display: none;
  @media (min-width: 900px) {
    display: block;
    /* Sticks below the sticky site header while the product grid scrolls.
       align-self:start stops the grid item from stretching so sticky can work. */
    position: sticky;
    top: 120px;
    align-self: start;
    max-height: calc(100vh - 140px);
    overflow-y: auto;
    /* Hide the scrollbar while keeping scroll functionality */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE/Edge */
    &::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Edge */
    }
  }
`;

const FilterCard = styled.div`
  background: #fff;
  border: 1.5px solid #f1f5f9;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
`;

const FilterTitle = styled.h3`
  margin: 0 0 14px;
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #0f172a;
`;

const CatItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  border: none;
  background: ${({ $a }) => ($a ? "#dcfce7" : "transparent")};
  color: ${({ $a }) => ($a ? "#16a34a" : "#475569")};
  font-size: 13px;
  font-weight: ${({ $a }) => ($a ? "700" : "600")};
  cursor: pointer;
  transition: all 0.15s;
  margin-bottom: 2px;
  &:hover {
    background: #f0fdf4;
  }
`;

const CatCount = styled.span`
  font-size: 11px;
  color: #94a3b8;
  font-weight: 600;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 999px;
`;

const PriceRange = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const PriceInput = styled.input`
  width: 80px;
  padding: 8px 10px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  outline: none;
  &:focus {
    border-color: #16a34a;
  }
`;

const RatingRow = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 7px 10px;
  border-radius: 8px;
  border: none;
  background: ${({ $a }) => ($a ? "#dcfce7" : "transparent")};
  cursor: pointer;
  margin-bottom: 2px;
  transition: all 0.15s;
  &:hover {
    background: #f0fdf4;
  }
`;

const Stars = styled.div`
  display: flex;
  gap: 2px;
  color: #fbbf24;
  font-size: 12px;
`;

const StarGray = styled.span`
  color: #e2e8f0;
`;

const ClearBtn = styled.button`
  width: 100%;
  padding: 10px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  &:hover {
    border-color: #ef4444;
    color: #ef4444;
  }
`;

/* Mobile category pill strip */
const MobileFilters = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  width: 100%;
  max-width: 100%;
  /* Hide scrollbar */
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
  margin-bottom: 12px;
  @media (min-width: 900px) {
    display: none;
  }
`;

const MobPill = styled.button`
  flex-shrink: 0;
  /* 36px height — touchable but not overly large */
  padding: 7px 14px;
  border: 1.5px solid ${({ $a }) => ($a ? "#16a34a" : "#e2e8f0")};
  background: ${({ $a }) => ($a ? "#16a34a" : "#fff")};
  color: ${({ $a }) => ($a ? "#fff" : "#374151")};
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
`;

/* Product grid — 2 columns on mobile, auto-fill on larger */
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  @media (min-width: 480px) {
    gap: 12px;
  }
  @media (min-width: 640px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 18px;
  }
`;

const MainContent = styled.div`
  min-width: 0;
  width: 100%;
  max-width: 100%;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  grid-column: 1 / -1;
  @media (min-width: 640px) {
    padding: 80px 20px;
  }
`;

const EmptyIcon = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #f0fdf4;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 28px;
  color: #16a34a;
  @media (min-width: 640px) {
    width: 80px;
    height: 80px;
    font-size: 32px;
    margin-bottom: 20px;
  }
`;

const EmptyTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 1.1rem;
  color: #0f172a;
`;

const EmptyText = styled.p`
  margin: 0;
  color: #64748b;
  font-size: 14px;
`;

export default function Shop() {
  const { visibleProducts: products, categories } = useProducts();
  const [searchParams] = useSearchParams();

  // Category chips are driven by the live categories from the backend.
  const CATS = useMemo(
    () => [{ key: "all", label: "All Products" }, ...categories.map((c) => ({ key: c.slug, label: c.name }))],
    [categories]
  );

  const [search, setSearch] = useState("");
  const [cat, setCat] = useState(searchParams.get("category") || "all");

  // Keep the active category in sync with the ?category= link (e.g. from the footer)
  useEffect(() => {
    const c = searchParams.get("category");
    if (c) setCat(c);
  }, [searchParams]);
  const [sort, setSort] = useState("featured");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rating, setRating] = useState(0);

  const filtered = useMemo(() => {
    let res = [...products];
    if (cat !== "all") res = res.filter((p) => p.category === cat);
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    if (minPrice) res = res.filter((p) => p.price >= parseFloat(minPrice));
    if (maxPrice) res = res.filter((p) => p.price <= parseFloat(maxPrice));
    if (rating) res = res.filter((p) => p.rating >= rating);
    if (sort === "price-low") res.sort((a, b) => a.price - b.price);
    if (sort === "price-high") res.sort((a, b) => b.price - a.price);
    if (sort === "rating") res.sort((a, b) => b.rating - a.rating);
    return res;
  }, [search, cat, sort, minPrice, maxPrice, rating, products]);

  const hasFilters = cat !== "all" || minPrice || maxPrice || rating > 0;

  const clearFilters = () => {
    setCat("all");
    setMinPrice("");
    setMaxPrice("");
    setRating(0);
    setSearch("");
  };

  return (
    <Page>
      <TopBar>
        <TopInner>
          <div>
            <PageTitle>Shop</PageTitle>
            <Count>{filtered.length} products found</Count>
          </div>
          <SearchWrap>
            <SearchIcon>
              <FaSearch />
            </SearchIcon>
            <SearchInput
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </SearchWrap>
          <SortBtn
            onClick={() =>
              setSort((s) =>
                s === "featured"
                  ? "price-low"
                  : s === "price-low"
                  ? "price-high"
                  : s === "price-high"
                  ? "rating"
                  : "featured"
              )
            }
          >
            <FaSort />
            {sort === "featured"
              ? "Featured"
              : sort === "price-low"
              ? "Price ↑"
              : sort === "price-high"
              ? "Price ↓"
              : "Top Rated"}
          </SortBtn>
        </TopInner>
      </TopBar>

      <Layout>
        {/* Desktop sidebar filters */}
        <Sidebar>
          {hasFilters && (
            <ClearBtn onClick={clearFilters}>
              <FaTimes /> Clear Filters
            </ClearBtn>
          )}
          <FilterCard style={{ marginTop: hasFilters ? 16 : 0 }}>
            <FilterTitle>Categories</FilterTitle>
            {CATS.map((c) => (
              <CatItem key={c.key} $a={cat === c.key} onClick={() => setCat(c.key)}>
                {c.label}
                <CatCount>
                  {products.filter((p) => c.key === "all" ? true : p.category === c.key).length}
                </CatCount>
              </CatItem>
            ))}
          </FilterCard>
          <FilterCard>
            <FilterTitle>Price Range</FilterTitle>
            <PriceRange>
              <PriceInput
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                onWheel={(e) => e.target.blur()}
              />
              <span style={{ color: "#94a3b8", fontWeight: 700 }}>—</span>
              <PriceInput
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                onWheel={(e) => e.target.blur()}
              />
            </PriceRange>
          </FilterCard>
          <FilterCard>
            <FilterTitle>Minimum Rating</FilterTitle>
            {[4, 3, 2, 1].map((r) => (
              <RatingRow
                key={r}
                $a={rating === r}
                onClick={() => setRating(rating === r ? 0 : r)}
              >
                <Stars>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i}>{i <= r ? "★" : <StarGray>★</StarGray>}</span>
                  ))}
                </Stars>
                <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                  & Up
                </span>
              </RatingRow>
            ))}
          </FilterCard>
        </Sidebar>

        {/* Main content */}
        <MainContent>
          {/* Mobile category pill strip */}
          <MobileFilters>
            {CATS.map((c) => (
              <MobPill
                key={c.key}
                $a={cat === c.key}
                onClick={() => setCat(c.key)}
              >
                {c.label}
              </MobPill>
            ))}
          </MobileFilters>

          <Grid>
            {filtered.length > 0 ? (
              filtered.map((p) => <ProductCard key={p.id} product={p} />)
            ) : (
              <EmptyState>
                <EmptyIcon>
                  <FaLeaf />
                </EmptyIcon>
                <EmptyTitle>No products found</EmptyTitle>
                <EmptyText>Try adjusting your filters or search query</EmptyText>
              </EmptyState>
            )}
          </Grid>
        </MainContent>
      </Layout>
    </Page>
  );
}