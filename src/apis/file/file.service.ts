import { Injectable, NotFoundException } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { getToday } from 'src/commons/libraries/utils';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileService {
  async uploadOne({ file }) {
    try {
      const storage = new Storage({
        projectId: process.env.GOOGLE_BUCKET_PROJECT_ID,
        keyFilename: process.env.GOOGLE_BUCKET_KEY_FILENAME,
      }).bucket(process.env.GOOGLE_BUCKET);

      const result = await new Promise((resolve, reject) => {
        const fname = `${getToday()}/${uuidv4()}/origin/${file.filename}`;
        // console.log(`fname = ${fname}`); //추후 이미지 업로드를 대비하여 남겨놓음
        file
          .createReadStream()
          .pipe(storage.file(fname).createWriteStream())
          .on('finish', () => resolve(`${fname}`))
          .on('error', () => reject('이미지 저장에 실패하였습니다.'));
      });

      return result;
    } catch (error) {
      throw new NotFoundException('이미지 저장 도중 오류가 발생하였습니다.');
    }
  }

  async upload({ files }) {
    try {
      const waitedFiles = await Promise.all(files);

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
                .on('finish', () => resolve(`${fname}`))
                .on('error', () => reject('이미지 저장에 실패하였습니다.'));
            }),
        ),
      );

      return results;
    } catch (error) {
      throw new NotFoundException('이미지 저장 도중 오류가 발생하였습니다.');
    }
  }

  async delete({ url }) {
    try {
      const storage = new Storage({
        projectId: process.env.GOOGLE_BUCKET_PROJECT_ID,
        keyFilename: process.env.GOOGLE_BUCKET_KEY_FILENAME,
      }).bucket(process.env.GOOGLE_BUCKET);

      const result = await new Promise((resolve) => {
        storage.file(url).delete();
        resolve(true);
      });

      return result;
    } catch (error) {
      throw new NotFoundException('이미지 삭제 도중 오류가 발생하였습니다.');
    }
  }
}
