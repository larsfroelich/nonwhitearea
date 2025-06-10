# nonwhitearea
Calculates the area of non-white space on a set of images.

## Installation

Install the CLI globally so that the `nonwhitearea` command becomes available:

```bash
npm install -g nonwhitearea
```

## Usage

Run the tool from the folder containing the images you want to analyse:

```bash
nonwhitearea
```

You will be presented with a menu to either test your settings on a single
image or process an entire batch. When processing multiple files, you will be
asked to select a calibration image that contains a one-unit dark area used to
determine the size of the other dark regions.

## Output

Processed images are written to a `nonwhitearea_output` directory. After all
images have been processed, a `nowhitearea.json` file is created in your
current working directory. This JSON maps each filename to the calculated dark
area relative to the calibration image.

## Requirements

* Node.js 14 or newer
