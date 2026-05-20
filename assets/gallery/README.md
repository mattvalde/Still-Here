Put gallery photos in `assets/gallery/photos/`, then run this from the project folder:

```sh
node tools/build-gallery-manifest.mjs
```

The gallery reads `assets/gallery/photos.json` and loads the images in batches so very large collections stay responsive.
