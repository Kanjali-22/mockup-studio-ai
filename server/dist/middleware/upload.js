"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALLOWED_MIME_TYPES = exports.MAX_FILE_SIZE_MB = exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const os_1 = __importDefault(require("os"));
const errorHandler_1 = require("./errorHandler");
const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10);
exports.MAX_FILE_SIZE_MB = MAX_FILE_SIZE_MB;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
exports.ALLOWED_MIME_TYPES = ALLOWED_MIME_TYPES;
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, os_1.default.tmpdir());
    },
    filename: (_req, _file, cb) => {
        const safeId = (0, uuid_1.v4)();
        cb(null, `upload-${safeId}`);
    },
});
function fileFilter(_req, file, cb) {
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return cb((0, errorHandler_1.createError)(`File type not allowed. Accepted types: ${ALLOWED_MIME_TYPES.join(', ')}`, 400, 'INVALID_FILE_TYPE'));
    }
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return cb((0, errorHandler_1.createError)(`File extension not allowed. Accepted extensions: ${ALLOWED_EXTENSIONS.join(', ')}`, 400, 'INVALID_FILE_EXTENSION'));
    }
    cb(null, true);
}
exports.uploadMiddleware = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE_BYTES,
        files: 1,
        fields: 20,
    },
    fileFilter,
});
//# sourceMappingURL=upload.js.map