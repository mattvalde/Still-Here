Put gallery photos into the day folder they belong in:

```text
assets/gallery/photos/day-1/
assets/gallery/photos/day-2/
assets/gallery/photos/day-3/
assets/gallery/photos/day-4/
assets/gallery/photos/day-5/
assets/gallery/photos/day-6/
assets/gallery/photos/day-7/
```

Then run this from the project folder:

```sh
node tools/build-gallery-manifest.mjs
```

That command updates:

- `assets/gallery/photos.json`, which the website uses.
- `assets/gallery/captions.json`, which is the easy file to edit.

To add captions, open `assets/gallery/captions.json` and fill in the `caption` next to each image. You can also change `day` there if an image is in the wrong day.

Example:

```json
{
  "assets/gallery/photos/day-1/example.jpg": {
    "day": "1",
    "caption": "Students arriving at the first site."
  }
}
```

After editing captions, run the command again:

```sh
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
