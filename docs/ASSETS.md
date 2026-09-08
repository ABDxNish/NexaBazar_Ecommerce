# NexaBazar Assets

All storefront visuals required by the seeded application are bundled locally under `frontend/public/`.

No product page depends on a remote image URL for its default seeded content.

## Logo

```text
frontend/public/logo.svg
```

## Hero images

```text
frontend/public/images/hero/hero-1.png
frontend/public/images/hero/hero-2.png
frontend/public/images/hero/hero-3.png
```

## Category images

```text
frontend/public/images/categories/electronics.png
frontend/public/images/categories/fashion.png
frontend/public/images/categories/beauty.png
frontend/public/images/categories/home.png
frontend/public/images/categories/lifestyle.png
```

## Product images

Each seeded product has a main image and an alternate/gallery image.

```text
frontend/public/images/products/headphones.png
frontend/public/images/products/headphones-alt.png
frontend/public/images/products/watch.png
frontend/public/images/products/watch-alt.png
frontend/public/images/products/keyboard.png
frontend/public/images/products/keyboard-alt.png
frontend/public/images/products/speaker.png
frontend/public/images/products/speaker-alt.png
frontend/public/images/products/sneakers.png
frontend/public/images/products/sneakers-alt.png
frontend/public/images/products/hoodie.png
frontend/public/images/products/hoodie-alt.png
frontend/public/images/products/perfume.png
frontend/public/images/products/perfume-alt.png
frontend/public/images/products/skincare.png
frontend/public/images/products/skincare-alt.png
frontend/public/images/products/lamp.png
frontend/public/images/products/lamp-alt.png
frontend/public/images/products/flask.png
frontend/public/images/products/flask-alt.png
frontend/public/images/products/backpack.png
frontend/public/images/products/backpack-alt.png
frontend/public/images/products/camera.png
frontend/public/images/products/camera-alt.png
```

## Animated asset

```text
frontend/public/images/deal-loop.gif
```

It is used in the promotional section to ensure the site does not feel like a plain static HTML/Tailwind assignment.

## Design-inspiration screenshots

The screenshots supplied for design direction are preserved for reference only:

```text
frontend/public/docs/inspiration-home.png
frontend/public/docs/inspiration-works.png
```

The storefront implementation is an original layout and is not intended as a direct copy of those references.

## Admin-uploaded images

When an admin uploads a new product image, it is stored in:

```text
backend/uploads/products/
```

Those runtime uploads are excluded from Git by default except for `.gitkeep`.
