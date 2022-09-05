import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { getToday } from 'src/commons/libraries/utils';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileService {
  async upload({ files }) {
    const waitedFiles = await Promise.all(files);

    const address = 'https://storage.googleapis.com';
    const bucket = process.env.GOOGLE_BUCKET;
    const storage = new Storage({
      projectId: process.env.GOOGLE_BUCKET_PROJECT_ID,
      keyFilename: process.env.GOOGLE_BUCKET_KEY_FILENAME,
    }).bucket(process.env.GOOGLE_BUCKET);

    const results = await Promise.all(
      waitedFiles.map(
        (ele) =>
          new Promise((resolve, reject) => {
            const fname = `${getToday()}/${uuidv4()}/origin/${ele.filename}`;
            ele
              .createReadStream()
              .pipe(storage.file(fname).createWriteStream())
              .on('finish', () => resolve(`${address}/${bucket}/${fname}`))
              .on('error', () => reject('이미지 저장에 실패하였습니다.'));
          }),
      ),
    );

    return results;
  }

  async delete({ url }) {
    const storage = new Storage({
      projectId: process.env.GOOGLE_BUCKET_PROJECT_ID,
      keyFilename: process.env.GOOGLE_BUCKET_KEY_FILENAME,
    }).bucket(process.env.GOOGLE_BUCKET);

    const results = await Promise.all(
      url.map(
        (ele) =>
          new Promise((resolve) => {
            const fname = ele.split('openrun-storage/')[1];
            storage.file(fname).delete();
            resolve(true);
          }),
      ),
    );

    return results;
  }
}
