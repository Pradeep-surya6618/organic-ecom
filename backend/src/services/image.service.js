class ImageService {
    processImage(file) {
        if (!file) return null;
        return {
            data: file.buffer,
            contentType: file.mimetype,
            filename: file.originalname
        };
    }

    processMultipleImages(files) {
        if (!files || files.length === 0) return [];
        return files.map(file => this.processImage(file));
    }
}
module.exports = new ImageService();