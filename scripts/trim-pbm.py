#!/usr/bin/env python3
"""Crop PBM (P4) to tight bounding box of black pixels."""

from __future__ import annotations

import sys


def read_p4(path: str) -> tuple[int, int, bytes]:
    with open(path, "rb") as f:
        magic = f.readline()
        if magic.strip() != b"P4":
            raise ValueError(f"{path}: expected P4, got {magic!r}")

        line = f.readline()
        while line.startswith(b"#"):
            line = f.readline()
        w, h = map(int, line.split())

        rowbytes = (w + 7) // 8
        data = f.read(rowbytes * h)
        if len(data) != rowbytes * h:
            raise ValueError(f"{path}: truncated bitmap")

    return w, h, data


def is_black(data: bytes, w: int, x: int, y: int) -> bool:
    rowbytes = (w + 7) // 8
    idx = y * rowbytes + x // 8
    bit = 7 - (x % 8)
    return bool((data[idx] >> bit) & 1)


def bbox(data: bytes, w: int, h: int) -> tuple[int, int, int, int]:
    min_x, min_y = w, h
    max_x, max_y = -1, -1

    for y in range(h):
        for x in range(w):
            if is_black(data, w, x, y):
                if x < min_x:
                    min_x = x
                if x > max_x:
                    max_x = x
                if y < min_y:
                    min_y = y
                if y > max_y:
                    max_y = y

    if max_x < 0:
        raise ValueError("empty bitmap")

    return min_x, min_y, max_x, max_y


def crop(data: bytes, w: int, h: int, x0: int, y0: int, x1: int, y1: int) -> tuple[int, int, bytes]:
    nw = x1 - x0 + 1
    nh = y1 - y0 + 1
    out_rowbytes = (nw + 7) // 8
    out = bytearray(out_rowbytes * nh)

    for y in range(nh):
        for x in range(nw):
            if is_black(data, w, x0 + x, y0 + y):
                idx = y * out_rowbytes + x // 8
                bit = 7 - (x % 8)
                out[idx] |= 1 << bit

    return nw, nh, bytes(out)


def write_p4(path: str, w: int, h: int, data: bytes) -> None:
    with open(path, "wb") as f:
        f.write(f"P4\n{w} {h}\n".encode())
        f.write(data)


def main() -> None:
    if len(sys.argv) != 3:
        print(f"usage: {sys.argv[0]} input.pbm output.pbm", file=sys.stderr)
        raise SystemExit(2)

    w, h, data = read_p4(sys.argv[1])
    x0, y0, x1, y1 = bbox(data, w, h)
    nw, nh, cropped = crop(data, w, h, x0, y0, x1, y1)
    write_p4(sys.argv[2], nw, nh, cropped)
    print(f"trim {w}x{h} -> {nw}x{nh}", file=sys.stderr)


if __name__ == "__main__":
    main()
