import crypto from "crypto";
import * as jwt from "jwt-simple";

export function md5(password: string): string {
    return crypto.createHash('md5').update(password).digest("hex");
}

export function authToken(email: string, password: string): string {
    const data = `${email.toLowerCase()}:${password}`;
    return encrypt(jwt.encode({ data }, process.env.SECRET));
}

export function isNullOrEmpty(value: string): boolean {
    return (!value || 0 === value.length);
}

export function contain(arr, value): boolean {
    return arr.indexOf(value) > -1
}

export function chunk(array, size) {
    const chunked_arr = [];
    let copied = [...array];
    const numOfChild = Math.ceil(copied.length / size);
    for (let i = 0; i < numOfChild; i++) {
        chunked_arr.push(copied.splice(0, size));
    }
    return chunked_arr;
}

export function timestamp(): number {
    return new Date().getTime();
}

export function isPhoto(mimetype: string): boolean {
    return mimetype && mimetype == 'image/jpeg' || mimetype == 'image/jpg' || mimetype == 'image/png';
}

export function fileExt(fileName: string): string {
    return fileName.split('.').pop();
}

export function isVideo(mimetype: string): boolean {
    if (!mimetype) return false;
    switch (mimetype) {
        case 'video/mp4':
        case 'video/quicktime':
        case 'video/mpeg':
        case 'video/mp2t':
        case 'video/webm':
        case 'video/ogg':
        case 'video/x-ms-wmv':
        case 'video/x-msvideo':
        case 'video/3gpp':
        case 'video/3gpp2':
            return true;
        default:
            return false;
    }
}

export function isStringNullOrEmpty(checkString: string): boolean {
    return typeof checkString === 'string' && checkString !== null && checkString.length > 0 ? true : false;
}

export function isArrayPopulated(checkArray: any): boolean {
    if (checkArray !== 'undefined'
        && checkArray !== null
        && Array.isArray(checkArray)
        && checkArray.length > 0) {
        return true;
    }
    return false;
}

export function stringTONumber(checkString: string | number): number {
    return typeof checkString === 'string' ? parseInt(checkString) : checkString;
}
export function paginationData(totalCount: number, LIMIT: number, OFFSET: number) {
    let totalPages = Math.ceil(totalCount / LIMIT);
    let currentPage = Math.floor(OFFSET / LIMIT);
    let prevPage = (currentPage - 1) > 0 ? (currentPage - 1) * LIMIT : 0;
    let nextPage = (currentPage + 1) <= totalPages ? (currentPage + 1) * LIMIT : 0;

    return {
        page: {
            nextPage,
            prevPage,
            totalCount,
            currentPage: currentPage + 1
        }
    }
}
export function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function encrypt(data) {
    var cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPT_TOKEN)
    var crypted = cipher.update(data, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
}

export function decrypt(data) {
    var decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPT_TOKEN)
    var dec = decipher.update(data, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
}
