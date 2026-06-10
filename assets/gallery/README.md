Put gallery photos into a folder for the day they belong in. Folder names can be simple, like `Day1` or `Day2`, or use dashes like `day-1`.

```text
assets/gallery/photos/Day1/
assets/gallery/photos/Day2/
assets/gallery/photos/Day3/
assets/gallery/photos/Day4/
assets/gallery/photos/Day5/
assets/gallery/photos/Day6/
assets/gallery/photos/Day7/
```

Then run this from the project folder:

```sh
node tools/build-gallery-manifest.mjs
```

That command updates:

- `assets/gallery/photos.json`, which the website uses.
- `assets/gallery/captions.json`, which is the easy file to edit.

To add captions, open `assets/gallery/captions.json` and fill in the `caption` next to each image. You can also change `day` there if an image is in the wrong day. Run the manifest command again after editing captions so `photos.json` gets the new text.

Example:

```json
{
  "assets/gallery/photos/Day1/example.jpg": {
    "day": "1",
    "caption": "Students arriving at the first site."
  }
}
```

Quick workflow:

```sh
# 1. Add images to assets/gallery/photos/Day1, Day2, etc.
# 2. Create/update the caption helper file.
node tools/build-gallery-manifest.mjs

# 3. Edit assets/gallery/captions.json.
# 4. Copy captions into the website manifest.
node tools/build-gallery-manifest.mjs
```

The gallery loads images in batches so very large collections stay responsive.

## Daily Reflections

Daily reflections live in `assets/gallery/reflections.json`. Each day can have a title and multiple paragraphs.

Example:

```json
{
  "1": {
    "title": "Day 1 Reflection",
    "paragraphs": [
      "First paragraph of the reflection.",
      "Second paragraph of the reflection."
    ]
  }
}
```

The reflection appears at the bottom of that day in the gallery.
