import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { getToday } from 'src/commons/libraries/utils';
import { v4 as uuidv4 } from 'uuid';
import { isCompositeType } from 'graphql';

@Injectable()
export class FileService {
  async uploadOne({ file }) {
    const storage = new Storage({
      projectId: process.env.GOOGLE_BUCKET_PROJECT_ID,
      keyFilename: process.env.GOOGLE_BUCKET_KEY_FILENAME,
    }).bucket(process.env.GOOGLE_BUCKET);

    const result = await new Promise((resolve, reject) => {
      const fname = `profile/${getToday()}/${uuidv4()}/origin/${file.filename}`;
      file
        .createReadStream()
        .pipe(storage.file(fname).createWriteStream())
        .on('finish', () => resolve(`${fname}`))
        .on('error', () => reject('이미지 저장에 실패하였습니다.'));
    });

    return result;
  }

  async upload({ files }) {
    const waitedFiles = await Promise.all(files);

    const storage = new Storage({
      projectId: process.env.GOOGLE_BUCKET_PROJECT_ID,
      keyFilename: process.env.GOOGLE_BUCKET_KEY_FILENAME,
    }).bucket(process.env.GOOGLE_BUCKET);

    const results = await Promise.all(
      waitedFiles.map(
        (ele) =>
          new Promise((resolve, reject) => {
            const fname = `board/${getToday()}/${uuidv4()}/origin/${
              ele.filename
            }`;
            ele
              .createReadStream()
              .pipe(storage.file(fname).createWriteStream())
              .on('finish', () => resolve(`${fname}`))
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
            storage.file(ele.url).delete();
            resolve(true);
          }),
      ),
    );

    return results;
  }
}
