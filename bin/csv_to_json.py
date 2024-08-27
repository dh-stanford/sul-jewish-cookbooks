#!/usr/bin/env python3

"""Covert CSV to JSON."""

import argparse
import csv
import json
import logging
from pathlib import Path


def parse_csv(input):
    """Parse CSV."""

    parsed = []

    with open(input, "r") as _fh:
        reader = csv.DictReader(_fh, delimiter="\t")
        for i, row in enumerate(reader):
            # del row["File"]
            if not any(_ for _ in row.values()):
                logging.warning("Empty row: %s", i)
                continue
            parsed.append(list(row.values()))

    return parsed


def main():
    """Command-line entry-point."""

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    parser = argparse.ArgumentParser(description="Description: {}".format(__doc__))
    parser.add_argument("-i", "--input", action="store", required=True)
    args = parser.parse_args()

    parsed = parse_csv(args.input)
    logging.info("%s records parsed", len(parsed))

    jsonOut = json.dumps(parsed)

    with Path(args.input).with_suffix(".json").open("w") as _fh:
        _fh.write(jsonOut)


if __name__ == "__main__":
    main()
