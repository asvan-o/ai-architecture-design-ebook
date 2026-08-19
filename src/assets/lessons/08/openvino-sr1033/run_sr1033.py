from pathlib import Path
import math
import time

import cv2
import numpy as np
import openvino as ov


ROOT = Path(__file__).resolve().parent

MODEL_PATH = ROOT / "model" / "single-image-super-resolution-1033.xml"
INPUT_DIR = ROOT / "input"
OUTPUT_DIR = ROOT / "output"

EXTENSIONS = {".png", ".jpg", ".jpeg", ".bmp", ".tif", ".tiff"}

TILE_W = 640
TILE_H = 360
SCALE = 3

MARGIN = 10

STEP_W = TILE_W - (MARGIN * 2)
STEP_H = TILE_H - (MARGIN * 2)


def read_image(path):
    data = np.fromfile(str(path), dtype=np.uint8)
    return cv2.imdecode(data, cv2.IMREAD_COLOR)


def save_png(path, image):
    success, encoded = cv2.imencode(
        ".png",
        image,
        [cv2.IMWRITE_PNG_COMPRESSION, 0]
    )

    if not success:
        raise RuntimeError("이미지 저장 실패")

    encoded.tofile(str(path))


def convert_result(result):
    result = result.squeeze(0).transpose(1, 2, 0)
    result = result * 255.0
    result = np.clip(result, 0, 255)
    return result.astype(np.uint8)


if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"모델 파일을 찾을 수 없습니다: {MODEL_PATH}"
    )


OUTPUT_DIR.mkdir(exist_ok=True)

image_files = [
    p for p in INPUT_DIR.iterdir()
    if p.is_file() and p.suffix.lower() in EXTENSIONS
]


if not image_files:
    print("")
    print("========================================")
    print(" input 폴더에 이미지가 없습니다.")
    print(" PNG 또는 JPG 이미지를 넣어주세요.")
    print("========================================")
    raise SystemExit


print("")
print("========================================")
print(" OpenVINO SR1033")
print(" General Image Super Resolution")
print(" Scale : 3x")
print(" Device: CPU")
print(" Tile  : 640 x 360")
print("========================================")


core = ov.Core()

model = core.read_model(str(MODEL_PATH))

compiled_model = core.compile_model(
    model,
    "CPU"
)

inputs = sorted(
    compiled_model.inputs,
    key=lambda x: int(
        np.prod([int(v) for v in x.shape])
    )
)

original_input = inputs[0]
bicubic_input = inputs[1]
output_layer = compiled_model.output(0)


for image_path in image_files:

    print("")
    print("----------------------------------------")
    print("처리 중:", image_path.name)

    image = read_image(image_path)

    if image is None:
        print("이미지 읽기 실패:", image_path.name)
        continue

    height, width = image.shape[:2]

    print(f"원본 크기 : {width} x {height}")
    print(f"출력 예정 : {width * SCALE} x {height * SCALE}")

    start_time = time.time()

    tiles_x = max(1, math.ceil(width / STEP_W))
    tiles_y = max(1, math.ceil(height / STEP_H))

    extra_right = tiles_x * STEP_W - width
    extra_bottom = tiles_y * STEP_H - height

    padded = cv2.copyMakeBorder(
        image,
        MARGIN,
        MARGIN + extra_bottom,
        MARGIN,
        MARGIN + extra_right,
        cv2.BORDER_REPLICATE
    )

    sr_image = np.empty(
        (height * SCALE, width * SCALE, 3),
        dtype=np.uint8
    )

    total_tiles = tiles_x * tiles_y
    tile_number = 0


    for ty in range(tiles_y):

        for tx in range(tiles_x):

            tile_number += 1

            x = tx * STEP_W
            y = ty * STEP_H

            tile = padded[
                y:y + TILE_H,
                x:x + TILE_W
            ]

            bicubic = cv2.resize(
                tile,
                (TILE_W * SCALE, TILE_H * SCALE),
                interpolation=cv2.INTER_CUBIC
            )

            original_data = np.expand_dims(
                tile.transpose(2, 0, 1),
                axis=0
            )

            bicubic_data = np.expand_dims(
                bicubic.transpose(2, 0, 1),
                axis=0
            )

            result = compiled_model(
                {
                    original_input.any_name: original_data,
                    bicubic_input.any_name: bicubic_data,
                }
            )[output_layer]

            result_image = convert_result(result)

            crop = MARGIN * SCALE

            inner = result_image[
                crop:-crop,
                crop:-crop,
                :
            ]

            dst_x = tx * STEP_W
            dst_y = ty * STEP_H

            copy_w = min(
                STEP_W,
                width - dst_x
            )

            copy_h = min(
                STEP_H,
                height - dst_y
            )

            sr_image[
                dst_y * SCALE:(dst_y + copy_h) * SCALE,
                dst_x * SCALE:(dst_x + copy_w) * SCALE
            ] = inner[
                :copy_h * SCALE,
                :copy_w * SCALE
            ]

            print(
                f"타일 {tile_number}/{total_tiles}",
                end="\r"
            )


    sr_output = OUTPUT_DIR / (
        f"{image_path.stem}_SR1033_3x.png"
    )

    save_png(
        sr_output,
        sr_image
    )


    bicubic_full = cv2.resize(
        image,
        (width * SCALE, height * SCALE),
        interpolation=cv2.INTER_CUBIC
    )

    bicubic_output = OUTPUT_DIR / (
        f"{image_path.stem}_Bicubic_3x.png"
    )

    save_png(
        bicubic_output,
        bicubic_full
    )


    elapsed = time.time() - start_time

    print("")
    print("완료!")
    print(f"SR1033 : {sr_output.name}")
    print(f"Bicubic: {bicubic_output.name}")
    print(f"처리 시간: {elapsed:.1f}초")


print("")
print("========================================")
print(" 모든 이미지 처리 완료")
print(" output 폴더에서 결과를 비교하세요.")
print("========================================")
