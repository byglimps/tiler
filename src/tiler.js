import Jimp from "jimp";
import uuid from "uuid/v1";
import { resolve as path_resolve } from "path";

const WIDTH = 1024;
const HEIGHT = 768;
const PADDING = 24;

const BORDER_COLORS = {
  white: 0xffffffff,
  black: 0x00000000
};

/**
 *
 * @param {number} topX
 * @param {number} topY
 */
const makeCoords = (topX, topY) => ({
  x: topX,
  y: topY
});

const calculateDims = () => {
  let availW = WIDTH - PADDING * 3;
  let availH = HEIGHT - PADDING * 3;

  let image_width = Math.floor(availW / 2);
  let image_height = Math.floor(availH / 2);

  return {
    image_width,
    image_height
  };
};

const getDestInfo = () => {
  const fileName = `c_${uuid()}.jpg`;
  return {
    file_name: fileName,
    file_path: path_resolve(`tmp/${fileName}`)
  };
};

/**
 *
 * @param {Jimp} canvas
 * @param {path} path
 */
const saveCanvas = (canvas, path) => {
  return new Promise(resolve => {
    canvas.write(path, resolve);
  });
};

/**
 * Creates a new Jimp canvas
 * @param {number} w
 * @param {number} h
 * @param {number} bgColor
 * @returns {Promise<Jimp>}
 */
const makeImg = (w, h, bgColor = BORDER_COLORS.white) => {
  return new Promise((resolve, reject) => {
    new Jimp(w, h, bgColor, (err, image) => {
      if (err) {
        reject(err);
      }

      resolve(image);
    });
  });
};

const calculateCoords = (imgW, imgH, pad) => {
  let coords = [
    makeCoords(pad, pad),
    makeCoords(pad + imgW + pad, pad),
    makeCoords(pad, pad + imgH + pad),
    makeCoords(pad + imgW + pad, pad + imgH + pad)
  ];
  return coords;
};

/**
 * Rezises image to cover within bounds
 * @param {Jimp} image
 * @param {number} new_width
 * @param {number} new_height
 */
const getResizedImage = (image, new_width, new_height) => {
  image.cover(
    new_width,
    new_height,
    Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE
  );
  return image;
};

/**
 * Creates a 4 square collage, with 3 images and a brand image
 * in the last slot.
 * @param {Array<string>} files
 * @param {string} brand
 * @returns {Promise<{file_name: string, file_path: string}>}
 */
export const createCollage = async (files, brand) => {
  const paths = [...files, brand];
  const dest = getDestInfo();
  try {
    let { image_width, image_height } = calculateDims();
    let coords = calculateCoords(image_width, image_height, PADDING);
    let canvas = await makeImg(WIDTH, HEIGHT, BORDER_COLORS.white);

    for (var idx = 0; idx < paths.length; idx++) {
      let path = paths[idx];
      let { x, y } = coords[idx];
      let im = await Jimp.read(path);
      let resizedImg = await getResizedImage(im, image_width, image_height);
      canvas.composite(resizedImg, x, y);
    }

    await saveCanvas(canvas, dest.file_path);
    return dest;
  } catch (e) {
    return e;
  }
};
