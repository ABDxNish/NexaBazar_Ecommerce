import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity, UserRole } from '../users/user.entity';
import { CategoryEntity } from '../categories/category.entity';
import { ProductEntity } from '../products/product.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
    @InjectRepository(CategoryEntity) private readonly categories: Repository<CategoryEntity>,
    @InjectRepository(ProductEntity) private readonly products: Repository<ProductEntity>,
  ) {}

  async run() {
    let admin = await this.users.findOne({ where: { email: 'admin@nexabazar.com' } });
    if (!admin) {
      admin = await this.users.save(this.users.create({
        fullName: 'NexaBazar Admin',
        email: 'admin@nexabazar.com',
        phone: '01700000000',
        password: await bcrypt.hash('Admin@12345', 12),
        role: UserRole.ADMIN,
      }));
    }

    const categoryData = [
      { name: 'Electronics', slug: 'electronics', image: '/images/categories/electronics.png' },
      { name: 'Fashion', slug: 'fashion', image: '/images/categories/fashion.png' },
      { name: 'Beauty', slug: 'beauty', image: '/images/categories/beauty.png' },
      { name: 'Home & Living', slug: 'home-living', image: '/images/categories/home.png' },
      { name: 'Lifestyle', slug: 'lifestyle', image: '/images/categories/lifestyle.png' },
    ];

    const categoryMap: Record<string, CategoryEntity> = {};
    for (const item of categoryData) {
      let category = await this.categories.findOne({ where: { slug: item.slug } });
      if (!category) category = await this.categories.save(this.categories.create(item));
      categoryMap[item.slug] = category;
    }

    const productData = [
      {
        name: 'AeroBeat ANC Headphones', slug: 'aerobeat-anc-headphones', category: 'electronics', price: 6890, discountPercent: 12, stock: 28, featured: true, rating: 4.8, reviewCount: 126,
        shortDescription: 'Wireless over-ear headphones with active noise cancellation and 40-hour battery.',
        description: 'AeroBeat combines soft memory-foam cushions, deep bass, clear calls and active noise cancellation. USB-C fast charging gives hours of listening from a short charge. A practical everyday audio upgrade for study, travel and work.',
        images: ['/images/products/headphones.png', '/images/products/headphones-alt.png'],
      },
      {
        name: 'PulseFit Smart Watch', slug: 'pulsefit-smart-watch', category: 'electronics', price: 4590, discountPercent: 8, stock: 35, featured: true, rating: 4.7, reviewCount: 91,
        shortDescription: 'AMOLED smart watch with health tracking, notifications and seven-day battery life.',
        description: 'Track steps, heart rate, sleep and workouts from a bright AMOLED display. PulseFit is splash resistant and designed for daily use with customizable watch faces and smart notifications.',
        images: ['/images/products/watch.png', '/images/products/watch-alt.png'],
      },
      {
        name: 'KeyNova Mechanical Keyboard', slug: 'keynova-mechanical-keyboard', category: 'electronics', price: 5490, discountPercent: 0, stock: 19, featured: false, rating: 4.6, reviewCount: 54,
        shortDescription: 'Compact hot-swappable mechanical keyboard with tactile switches and RGB lighting.',
        description: 'A compact mechanical keyboard for coding, gaming and desk setups. It offers tactile switches, USB-C connectivity and per-key lighting with a sturdy frame.',
        images: ['/images/products/keyboard.png', '/images/products/keyboard-alt.png'],
      },
      {
        name: 'MiniBoom Bluetooth Speaker', slug: 'miniboom-bluetooth-speaker', category: 'electronics', price: 2990, discountPercent: 15, stock: 44, featured: true, rating: 4.5, reviewCount: 77,
        shortDescription: 'Portable Bluetooth speaker with punchy sound, IPX6 splash resistance and 12-hour playtime.',
        description: 'MiniBoom is made for rooms, rooftops and short trips. Dual passive radiators add fullness while the compact body remains easy to carry.',
        images: ['/images/products/speaker.png', '/images/products/speaker-alt.png'],
      },
      {
        name: 'UrbanStep Everyday Sneakers', slug: 'urbanstep-everyday-sneakers', category: 'fashion', price: 3290, discountPercent: 10, stock: 52, featured: true, rating: 4.7, reviewCount: 143,
        shortDescription: 'Lightweight everyday sneakers with cushioned sole and breathable upper.',
        description: 'UrbanStep balances comfort and clean styling for university, commuting and casual wear. The cushioned midsole and breathable upper are designed for all-day comfort.',
        images: ['/images/products/sneakers.png', '/images/products/sneakers-alt.png'],
      },
      {
        name: 'CloudWeave Oversized Hoodie', slug: 'cloudweave-oversized-hoodie', category: 'fashion', price: 2190, discountPercent: 5, stock: 61, featured: false, rating: 4.6, reviewCount: 68,
        shortDescription: 'Soft heavyweight oversized hoodie with brushed inner finish and minimal branding.',
        description: 'A relaxed everyday hoodie with a soft brushed interior, ribbed cuffs and a roomy front pocket. Made for simple layered outfits.',
        images: ['/images/products/hoodie.png', '/images/products/hoodie-alt.png'],
      },
      {
        name: 'Noor Bloom Eau de Parfum', slug: 'noor-bloom-eau-de-parfum', category: 'beauty', price: 2790, discountPercent: 18, stock: 33, featured: true, rating: 4.8, reviewCount: 110,
        shortDescription: 'Warm floral eau de parfum with citrus opening, jasmine heart and soft amber base.',
        description: 'Noor Bloom opens bright, settles into a floral heart and finishes with a smooth amber trail. Designed as an elegant everyday fragrance.',
        images: ['/images/products/perfume.png', '/images/products/perfume-alt.png'],
      },
      {
        name: 'DewDrop Skin Hydration Set', slug: 'dewdrop-skin-hydration-set', category: 'beauty', price: 1890, discountPercent: 0, stock: 26, featured: true, rating: 4.5, reviewCount: 39,
        shortDescription: 'Three-step gentle hydration set with cleanser, serum and lightweight moisturizer.',
        description: 'A simple daily skincare trio focused on hydration. The textures are lightweight and suitable for a straightforward morning or evening routine.',
        images: ['/images/products/skincare.png', '/images/products/skincare-alt.png'],
      },
      {
        name: 'Arc Ceramic Table Lamp', slug: 'arc-ceramic-table-lamp', category: 'home-living', price: 2490, discountPercent: 12, stock: 21, featured: false, rating: 4.4, reviewCount: 32,
        shortDescription: 'Minimal ceramic table lamp with warm fabric shade for bedroom or desk lighting.',
        description: 'The Arc lamp brings a warm, soft light to desks, side tables and reading corners. Its neutral ceramic base works with modern interiors.',
        images: ['/images/products/lamp.png', '/images/products/lamp-alt.png'],
      },
      {
        name: 'BrewMate Vacuum Flask', slug: 'brewmate-vacuum-flask', category: 'home-living', price: 1290, discountPercent: 7, stock: 75, featured: true, rating: 4.6, reviewCount: 84,
        shortDescription: 'Leak-resistant stainless-steel vacuum flask that keeps drinks hot or cold for hours.',
        description: 'BrewMate uses double-wall insulation and a secure lid for class, office or travel. The slim body fits common backpack bottle pockets.',
        images: ['/images/products/flask.png', '/images/products/flask-alt.png'],
      },
      {
        name: 'MetroCarry Everyday Backpack', slug: 'metrocarry-everyday-backpack', category: 'lifestyle', price: 2590, discountPercent: 10, stock: 48, featured: true, rating: 4.7, reviewCount: 72,
        shortDescription: 'Water-resistant everyday backpack with padded laptop sleeve and organized compartments.',
        description: 'MetroCarry is built for university and daily commuting with a padded laptop section, quick-access pocket and comfortable shoulder straps.',
        images: ['/images/products/backpack.png', '/images/products/backpack-alt.png'],
      },
      {
        name: 'SnapGo Compact Camera', slug: 'snapgo-compact-camera', category: 'lifestyle', price: 12490, discountPercent: 6, stock: 14, featured: false, rating: 4.5, reviewCount: 29,
        shortDescription: 'Pocket-friendly digital camera for casual travel photos, vlogs and everyday memories.',
        description: 'SnapGo keeps controls simple with a bright rear screen, compact body and easy USB-C transfer. It is designed as a fun lightweight camera for daily moments.',
        images: ['/images/products/camera.png', '/images/products/camera-alt.png'],
      },
    ];

    for (const item of productData) {
      const exists = await this.products.findOne({ where: { slug: item.slug } });
      if (exists) continue;
      const { category, ...data } = item;
      await this.products.save(this.products.create({ ...data, category: categoryMap[category] }));
    }

    return {
      message: 'Seed complete',
      admin: { email: 'admin@nexabazar.com', password: 'Admin@12345' },
      categories: await this.categories.count(),
      products: await this.products.count(),
    };
  }
}
