"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multiparty_1 = __importDefault(require("multiparty"));
const mime_types_1 = __importDefault(require("mime-types"));
let logger = console;
function setLogger(createLogger) {
    logger = createLogger(__filename);
}
function fileSaveLocal(req, svpath, urlbase) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            if (req.is('multipart/*')) {
                try {
                    if (!fs_1.default.existsSync(svpath)) {
                        let result = fs_1.default.mkdirSync(svpath, { recursive: true });
                        if (result) {
                            reject(result);
                        }
                    }
                    let uploadOptions = {
                        autoFields: true,
                        autoFiles: true,
                        uploadDir: svpath,
                        maxFileSize: 30 * 1024 * 1024,
                    };
                    let form = new multiparty_1.default.Form(uploadOptions);
                    form.parse(req, (err, fields, files) => {
                        if (err) {
                            reject(err);
                        }
                        if (files.file) {
                            logger.debug(files.file[0].path);
                            resolve({
                                name: files.file[0].originalFilename,
                                ext: path_1.default.extname(files.file[0].path),
                                url: urlbase + path_1.default.basename(files.file[0].path),
                                type: mime_types_1.default.lookup(path_1.default.extname(files.file[0].path)),
                                path: files.file[0].path,
                            });
                        }
                        else {
                            reject('no file');
                        }
                    });
                }
                catch (error) {
                    reject(error);
                }
            }
            else {
                reject('content-type error');
            }
        });
    });
}
exports.default = {
    setLogger,
    fileSaveLocal,
};
