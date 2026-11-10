// Decoy storefront: deterministic per-deployment branding (S2) and an
// edge-cache path for DECOY_URL (S6). Unknown/probe traffic always sees the
// same response shape: 200 + store.
import { escapeHtml } from "./util.js";

// Placeholder-marked variant of the v1.2.2 LUXVEIL storefront. Brand, palette,
// products and cities are substituted from the deployment secret (S2).
export const DECOY_TEMPLATE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="__BRAND__ — Premium contemporary fashion. Curated collections of designer apparel, outerwear, and accessories for the modern wardrobe.">
<meta name="robots" content="index, follow">
<meta property="og:title" content="__BRAND__ — Contemporary Fashion House">
<meta property="og:type" content="website">
<title>__BRAND__ &mdash; Contemporary Fashion House</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#faf9f7;--surface:#fff;--text:#1a1a1a;--muted:#71717a;--accent:__ACCENT__;--accent-light:__ACCENT_LIGHT__;--border:#e4e4e7;--hover:#f4f4f5;--gold:#b8860b;--shadow:0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);--shadow-lg:0 10px 25px rgba(0,0,0,.07),0 4px 10px rgba(0,0,0,.04)}
@keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
body{background:var(--bg);color:var(--text);font-family:'Segoe UI',system-ui,-apple-system,Helvetica,Arial,sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden}
a{color:inherit;text-decoration:none}
.announce{background:var(--text);color:#fff;text-align:center;padding:.55rem 1rem;font-size:.8rem;letter-spacing:.08em;text-transform:uppercase;overflow:hidden}
.announce-inner{display:inline-flex;gap:3rem;animation:marquee 25s linear infinite;white-space:nowrap}
nav{background:var(--surface);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100;backdrop-filter:blur(12px);background:rgba(255,255,255,.92)}
.nav-inner{max-width:1280px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:.85rem 2rem}
.nav-logo{font-size:1.4rem;font-weight:800;letter-spacing:.22em;text-transform:uppercase}
.nav-links{display:flex;gap:2rem;list-style:none;font-size:.88rem;font-weight:500;letter-spacing:.03em;text-transform:uppercase}
.nav-links a{position:relative;padding:.25rem 0;transition:color .2s}
.nav-links a::after{content:'';position:absolute;bottom:0;left:0;width:0;height:1.5px;background:var(--accent);transition:width .3s ease}
.nav-links a:hover::after{width:100%}
.nav-links a:hover{color:var(--accent)}
.nav-icons{display:flex;align-items:center;gap:1.25rem}
.nav-icons svg{width:20px;height:20px;stroke:var(--text);stroke-width:1.5;fill:none;cursor:pointer;transition:stroke .2s}
.nav-icons svg:hover{stroke:var(--accent)}
.cart-badge{position:relative}
.cart-badge::after{content:'2';position:absolute;top:-6px;right:-8px;background:var(--accent);color:#fff;font-size:.6rem;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700}
.hamburger{display:none;flex-direction:column;gap:4px;cursor:pointer;padding:4px}
.hamburger span{width:20px;height:1.5px;background:var(--text);border-radius:1px}
.hero{max-width:1280px;margin:0 auto;padding:0 2rem;display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center;min-height:75vh;animation:fadeIn .8s ease}
.hero-text{animation:fadeUp .9s ease .1s both}
.hero-tag{display:inline-block;font-size:.72rem;letter-spacing:.15em;text-transform:uppercase;color:var(--accent);background:var(--accent-light);padding:.35rem .9rem;border-radius:2rem;font-weight:600;margin-bottom:1.5rem}
.hero h1{font-size:3.5rem;font-weight:800;line-height:1.08;letter-spacing:-.02em;margin-bottom:1.25rem}
.hero h1 em{font-style:normal;color:var(--accent)}
.hero p{font-size:1.1rem;color:var(--muted);max-width:460px;margin-bottom:2rem;line-height:1.7}
.hero-btns{display:flex;gap:1rem;flex-wrap:wrap}
.btn{display:inline-flex;align-items:center;gap:.5rem;padding:.85rem 2rem;border-radius:.4rem;font-size:.88rem;font-weight:600;letter-spacing:.04em;text-transform:uppercase;transition:all .25s ease;cursor:pointer;border:none}
.btn-primary{background:var(--text);color:#fff}
.btn-primary:hover{background:var(--accent);transform:translateY(-1px);box-shadow:var(--shadow-lg)}
.btn-outline{background:transparent;color:var(--text);border:1.5px solid var(--border)}
.btn-outline:hover{border-color:var(--text);background:var(--hover)}
.hero-visual{position:relative;animation:fadeUp .9s ease .3s both}
.hero-img{width:100%;aspect-ratio:3/4;background:linear-gradient(135deg,#e8e0d6 0%,#d4c8b8 30%,#c9b99a 60%,#b8a88a 100%);border-radius:1rem;overflow:hidden;position:relative}
.hero-img::before{content:'';position:absolute;inset:0;background:linear-gradient(45deg,transparent 40%,rgba(255,255,255,.15) 50%,transparent 60%);background-size:200% 200%;animation:shimmer 4s ease-in-out infinite}
.hero-img::after{content:'__BRAND__';position:absolute;bottom:2rem;left:2rem;font-size:1.1rem;letter-spacing:.3em;text-transform:uppercase;color:rgba(255,255,255,.7);font-weight:300}
.hero-float{position:absolute;right:-1rem;top:25%;background:var(--surface);border-radius:.75rem;padding:1rem 1.25rem;box-shadow:var(--shadow-lg);animation:float 4s ease-in-out infinite;z-index:2}
.hero-float .hf-label{font-size:.65rem;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:.25rem}
.hero-float .hf-value{font-size:1.3rem;font-weight:700;color:var(--accent)}
.banner{background:var(--text);padding:1rem 0;overflow:hidden}
.banner-track{display:flex;gap:3rem;animation:marquee 20s linear infinite;white-space:nowrap}
.banner-track span{color:rgba(255,255,255,.6);font-size:.78rem;letter-spacing:.2em;text-transform:uppercase;font-weight:500}
.section{max-width:1280px;margin:0 auto;padding:5rem 2rem}
.section-head{text-align:center;margin-bottom:3.5rem}
.section-head h2{font-size:2.2rem;font-weight:800;letter-spacing:-.01em;margin-bottom:.75rem}
.section-head p{color:var(--muted);font-size:1rem;max-width:480px;margin:0 auto}
.products{display:grid;grid-template-columns:repeat(4,1fr);gap:1.5rem}
.product{cursor:pointer}
.product-img{aspect-ratio:3/4;border-radius:.75rem;overflow:hidden;position:relative;margin-bottom:1rem}
.product-img .img-fill{width:100%;height:100%;transition:transform .6s ease}
.product:hover .img-fill{transform:scale(1.06)}
.p1 .img-fill{background:linear-gradient(160deg,#c4b5a3,#a89279)}
.p2 .img-fill{background:linear-gradient(160deg,#2c2c2c,#555)}
.p3 .img-fill{background:linear-gradient(160deg,#8b7355,#c4a97d)}
.p4 .img-fill{background:linear-gradient(160deg,#d6cfc4,#a89888)}
.product-img .quick{position:absolute;bottom:0;left:0;right:0;background:rgba(26,26,26,.88);color:#fff;text-align:center;padding:.7rem;font-size:.78rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;transform:translateY(100%);transition:transform .35s ease;backdrop-filter:blur(4px)}
.product:hover .quick{transform:translateY(0)}
.product-info h3{font-size:.92rem;font-weight:600;margin-bottom:.3rem}
.product-info .cat{font-size:.75rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.4rem}
.product-info .price{font-size:.95rem;font-weight:700}
.product-info .price .old{text-decoration:line-through;color:var(--muted);font-weight:400;margin-left:.4rem;font-size:.85rem}
.product-colors{display:flex;gap:.35rem;margin-top:.5rem}
.product-colors span{width:14px;height:14px;border-radius:50%;border:1.5px solid var(--border);transition:transform .2s}
.product-colors span:hover{transform:scale(1.3)}
.features{display:grid;grid-template-columns:repeat(4,1fr);gap:2rem;margin-top:4rem}
.feature{text-align:center;padding:2rem 1.25rem;border-radius:.75rem;transition:all .3s ease}
.feature:hover{background:var(--surface);box-shadow:var(--shadow-lg);transform:translateY(-4px)}
.feature svg{width:32px;height:32px;stroke:var(--accent);stroke-width:1.5;fill:none;margin:0 auto 1rem}
.feature h4{font-size:.92rem;font-weight:700;margin-bottom:.4rem;text-transform:uppercase;letter-spacing:.04em}
.feature p{font-size:.82rem;color:var(--muted);line-height:1.6}
.lookbook{display:grid;grid-template-columns:1fr 1fr;gap:0;min-height:65vh;margin:5rem 0}
.lookbook-img{background:linear-gradient(160deg,#d4c4b0,#baa78c);position:relative;overflow:hidden}
.lookbook-img::before{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 60%,rgba(0,0,0,.2) 100%)}
.lookbook-content{display:flex;flex-direction:column;justify-content:center;padding:5rem 4rem;background:var(--surface)}
.lookbook-content .lb-tag{font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem}
.lookbook-content h2{font-size:2.8rem;font-weight:800;line-height:1.1;margin-bottom:1.25rem}
.lookbook-content p{color:var(--muted);font-size:1rem;line-height:1.8;margin-bottom:2rem;max-width:400px}
.reviews{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem}
.review{background:var(--surface);border:1px solid var(--border);border-radius:.75rem;padding:2rem;transition:box-shadow .3s,transform .3s}
.review:hover{box-shadow:var(--shadow-lg);transform:translateY(-3px)}
.review-stars{color:var(--gold);font-size:.85rem;margin-bottom:.75rem;letter-spacing:2px}
.review p{font-size:.9rem;color:var(--text);line-height:1.7;margin-bottom:1rem;font-style:italic}
.review-author{font-size:.8rem;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
.newsletter{text-align:center;background:var(--text);color:#fff;padding:5rem 2rem}
.newsletter h2{font-size:2rem;font-weight:800;margin-bottom:.75rem}
.newsletter p{color:rgba(255,255,255,.55);margin-bottom:2rem;font-size:.95rem}
.newsletter-form{display:flex;max-width:460px;margin:0 auto;border-radius:.4rem;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.2)}
.newsletter-form input{flex:1;padding:.9rem 1.25rem;border:none;font-size:.88rem;outline:none;background:#fff;color:var(--text)}
.newsletter-form button{padding:.9rem 1.8rem;background:var(--accent);color:#fff;border:none;font-size:.82rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:background .2s;white-space:nowrap}
footer{background:var(--surface);border-top:1px solid var(--border);padding:4rem 2rem 2rem}
.footer-inner{max-width:1280px;margin:0 auto}
.footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:3rem;margin-bottom:3rem}
.footer-brand .f-logo{font-size:1.2rem;font-weight:800;letter-spacing:.2em;text-transform:uppercase;margin-bottom:.75rem}
.footer-brand p{color:var(--muted);font-size:.85rem;line-height:1.7;max-width:280px}
.footer-col h5{font-size:.75rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-bottom:1rem}
.footer-col ul{list-style:none}
.footer-col li{margin-bottom:.5rem}
.footer-col a{font-size:.88rem;color:var(--text);transition:color .2s}
.footer-col a:hover{color:var(--accent)}
.footer-bottom{display:flex;justify-content:space-between;align-items:center;padding-top:2rem;border-top:1px solid var(--border);font-size:.78rem;color:var(--muted)}
.footer-social{display:flex;gap:1rem}
.footer-social svg{width:18px;height:18px;stroke:var(--muted);stroke-width:1.5;fill:none;transition:stroke .2s;cursor:pointer}
.footer-social svg:hover{stroke:var(--accent)}
@media(max-width:1024px){
.hero{grid-template-columns:1fr;text-align:center;min-height:auto;padding-top:3rem}
.hero h1{font-size:2.6rem}
.hero p{margin:0 auto 2rem}
.hero-btns{justify-content:center}
.hero-visual{max-width:400px;margin:0 auto}
.hero-float{display:none}
.products{grid-template-columns:repeat(2,1fr)}
.features{grid-template-columns:repeat(2,1fr)}
.lookbook{grid-template-columns:1fr}
.lookbook-content{padding:3rem 2rem}
.footer-grid{grid-template-columns:1fr 1fr}
.reviews{grid-template-columns:1fr}
}
@media(max-width:640px){
.nav-links{display:none}
.hamburger{display:flex}
.hero h1{font-size:2rem}
.products,.features,.footer-grid{grid-template-columns:1fr}
.newsletter-form{flex-direction:column}
.newsletter-form input,.newsletter-form button{width:100%}
.lookbook-content h2{font-size:2rem}
}
</style>
</head>
<body>
<div class="announce"><div class="announce-inner"><span>Free express shipping on orders over $150</span><span>&bull;</span><span>New Season &mdash; Autumn/Winter 2026 Collection now live</span><span>&bull;</span><span>Complimentary gift wrapping on all orders</span><span>&bull;</span><span>Free express shipping on orders over $150</span><span>&bull;</span><span>New Season &mdash; Autumn/Winter 2026 Collection now live</span><span>&bull;</span><span>Complimentary gift wrapping on all orders</span></div></div>
<nav><div class="nav-inner"><a href="/" class="nav-logo">__BRAND__</a><ul class="nav-links"><li><a href="/">New Arrivals</a></li><li><a href="/">Women</a></li><li><a href="/">Men</a></li><li><a href="/">Outerwear</a></li><li><a href="/">Accessories</a></li><li><a href="/">Sale</a></li></ul><div class="nav-icons"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><div class="cart-badge"><svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg></div><div class="hamburger"><span></span><span></span><span></span></div></div></div></nav>
<section class="hero"><div class="hero-text"><div class="hero-tag">Autumn/Winter 2026</div><h1>Redefine Your<br><em>Everyday</em> Elegance</h1><p>Discover our latest collection of meticulously crafted garments, designed with premium fabrics and contemporary silhouettes for the modern wardrobe.</p><div class="hero-btns"><a href="/" class="btn btn-primary">Shop Collection <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a><a href="/" class="btn btn-outline">Lookbook</a></div></div><div class="hero-visual"><div class="hero-img"></div><div class="hero-float"><div class="hf-label">Best Seller</div><div class="hf-value">__PRODUCT1__</div></div></div></section>
<div class="banner"><div class="banner-track"><span>Premium Quality</span><span>&#10022;</span><span>Sustainable Materials</span><span>&#10022;</span><span>Handcrafted Details</span><span>&#10022;</span><span>Worldwide Delivery</span><span>&#10022;</span><span>30-Day Returns</span><span>&#10022;</span><span>Premium Quality</span><span>&#10022;</span><span>Sustainable Materials</span><span>&#10022;</span><span>Handcrafted Details</span><span>&#10022;</span><span>Worldwide Delivery</span><span>&#10022;</span><span>30-Day Returns</span></div></div>
<section class="section"><div class="section-head"><h2>Curated Essentials</h2><p>Timeless pieces designed to transition seamlessly from season to season.</p></div><div class="products"><div class="product"><div class="product-img p1"><div class="img-fill"></div><div class="quick">Quick View</div></div><div class="product-info"><div class="cat">__CAT1__</div><h3>__PRODUCT1__</h3><div class="price">__PRICE1__</div><div class="product-colors"><span style="background:#c4b5a3"></span><span style="background:#2c2c2c"></span><span style="background:#8b7355"></span></div></div></div><div class="product"><div class="product-img p2"><div class="img-fill"></div><div class="quick">Quick View</div></div><div class="product-info"><div class="cat">__CAT2__</div><h3>__PRODUCT2__</h3><div class="price">__PRICE2__</div><div class="product-colors"><span style="background:#2c2c2c"></span><span style="background:#3d4f5f"></span></div></div></div><div class="product"><div class="product-img p3"><div class="img-fill"></div><div class="quick">Quick View</div></div><div class="product-info"><div class="cat">__CAT3__</div><h3>__PRODUCT3__</h3><div class="price">__PRICE3__ <span class="old">__OLDPRICE3__</span></div><div class="product-colors"><span style="background:#8b7355"></span><span style="background:#f5f0eb"></span><span style="background:#4a3728"></span></div></div></div><div class="product"><div class="product-img p4"><div class="img-fill"></div><div class="quick">Quick View</div></div><div class="product-info"><div class="cat">__CAT4__</div><h3>__PRODUCT4__</h3><div class="price">__PRICE4__</div><div class="product-colors"><span style="background:#d6cfc4"></span><span style="background:#2c2c2c"></span></div></div></div></div></section>
<section class="section" style="padding-top:0"><div class="features"><div class="feature"><svg viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8l4 2v4l-4 2"/></svg><h4>Free Shipping</h4><p>Complimentary express delivery on all orders over $150. Worldwide tracked shipping.</p></div><div class="feature"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg><h4>Secure Checkout</h4><p>256-bit SSL encryption with trusted payment partners. Your data is always protected.</p></div><div class="feature"><svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-9-9c2.5 0 4.8 1 6.5 2.6"/><path d="M22 4L12 14.01l-3-3"/></svg><h4>Quality Guarantee</h4><p>Every garment is inspected for quality. 30-day hassle-free returns and exchanges.</p></div><div class="feature"><svg viewBox="0 0 24 24"><path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/></svg><h4>Sustainable Fashion</h4><p>Ethically sourced materials with carbon-neutral shipping. Fashion with a conscience.</p></div></div></section>
<section class="lookbook"><div class="lookbook-img"></div><div class="lookbook-content"><div class="lb-tag">The Lookbook</div><h2>Autumn<br>Silhouettes</h2><p>Explore our editorial collection featuring rich tonal palettes, luxurious textures, and the defining shapes of the season. Each piece tells a story of understated refinement.</p><a href="/" class="btn btn-primary">View Lookbook</a></div></section>
<section class="section"><div class="section-head"><h2>What Our Clients Say</h2><p>Trusted by thousands of discerning customers worldwide.</p></div><div class="reviews"><div class="review"><div class="review-stars">&starf;&starf;&starf;&starf;&starf;</div><p>&ldquo;The quality of the __PRODUCT1_LC__ exceeded my expectations. Impeccable tailoring and the fabric feels absolutely luxurious.&rdquo;</p><div class="review-author">&mdash; Sarah M., __CITY1__</div></div><div class="review"><div class="review-stars">&starf;&starf;&starf;&starf;&starf;</div><p>&ldquo;Fast shipping to __CITY2__ and the packaging was beautiful. The __PRODUCT3_LC__ is now my go-to piece for every occasion.&rdquo;</p><div class="review-author">&mdash; Ahmed K., __CITY2__</div></div><div class="review"><div class="review-stars">&starf;&starf;&starf;&starf;&starf;</div><p>&ldquo;Finally found a brand that combines minimalist design with real craftsmanship. The __PRODUCT2_LC__ fits perfectly &mdash; no alterations needed.&rdquo;</p><div class="review-author">&mdash; Elena V., __CITY3__</div></div></div></section>
<section class="newsletter"><h2>Join the __BRAND__ World</h2><p>Subscribe for exclusive access to new collections, private sales, and style inspiration.</p><div class="newsletter-form"><input type="email" placeholder="Enter your email address" autocomplete="off"><button type="button">Subscribe</button></div></section>
<footer><div class="footer-inner"><div class="footer-grid"><div class="footer-brand"><div class="f-logo">__BRAND__</div><p>Contemporary fashion house crafting timeless garments with modern sensibility. Established 2019, shipping worldwide from our ateliers in __CITY3__ and __CITY1__.</p></div><div class="footer-col"><h5>Shop</h5><ul><li><a href="/">New Arrivals</a></li><li><a href="/">Women</a></li><li><a href="/">Men</a></li><li><a href="/">Outerwear</a></li><li><a href="/">Accessories</a></li><li><a href="/">Sale</a></li></ul></div><div class="footer-col"><h5>Company</h5><ul><li><a href="/">About Us</a></li><li><a href="/">Sustainability</a></li><li><a href="/">Careers</a></li><li><a href="/">Press</a></li><li><a href="/">Store Locator</a></li></ul></div><div class="footer-col"><h5>Support</h5><ul><li><a href="/">Contact Us</a></li><li><a href="/">Shipping &amp; Returns</a></li><li><a href="/">Size Guide</a></li><li><a href="/">FAQ</a></li><li><a href="/">Privacy Policy</a></li></ul></div></div><div class="footer-bottom"><span>&copy; 2026 __BRAND__ Ltd. All rights reserved.</span><div class="footer-social"><svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg><svg viewBox="0 0 24 24"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg><svg viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></div></div></div></footer>
</body>
</html>`;

// Substitute brand tokens. Everything is deterministic per deployment (S2).
export function brandifyDecoy(template, brand) {
  const [p1, p2, p3, p4] = brand.products;
  const [c1, c2, c3] = brand.cities;
  const lower = (s) => s.toLowerCase();
  const map = {
    __BRAND__: brand.name,
    __ACCENT__: brand.palette.accent,
    __ACCENT_LIGHT__: brand.palette.light,
    __PRODUCT1__: p1[0], __PRODUCT2__: p2[0], __PRODUCT3__: p3[0], __PRODUCT4__: p4[0],
    __PRODUCT1_LC__: lower(p1[0]), __PRODUCT2_LC__: lower(p2[0]), __PRODUCT3_LC__: lower(p3[0]),
    __CAT1__: p1[1], __CAT2__: p2[1], __CAT3__: p3[1], __CAT4__: p4[1],
    __PRICE1__: p1[2], __PRICE2__: p2[2], __PRICE3__: p3[2], __PRICE4__: p4[2],
    __OLDPRICE3__: p3[3],
    __CITY1__: c1, __CITY2__: c2, __CITY3__: c3
  };
  let out = template;
  for (const [k, v] of Object.entries(map)) out = out.split(k).join(escapeHtml(v));
  return out;
}

export function healthJson(brand, nowSeconds = Math.floor(Date.now() / 1000)) {
  return JSON.stringify({ status: "operational", store: brand.name, region: "global", uptime: "99.99%", timestamp: nowSeconds });
}

export function faviconSvg(brand) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#1a1a1a"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="800" font-size="14" fill="#fff" letter-spacing="2">${escapeHtml(brand.initials)}</text></svg>`;
}

function sha256HexSync(s) {
  // Cheap non-crypto stable key for the edge cache URL (FNV-1a is enough here;
  // the value is never a secret and only routes the cache lookup).
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

// Decoy response for unauthenticated/probe traffic. With DECOY_URL set, the
// upstream response is cached at the edge (caches.default, 60 s TTL) so repeated
// probes do not burn a subrequest each (S6). Without DECOY_URL the built-in
// branded storefront is returned; zero network calls, zero allocations after
// first build per isolate.
export async function decoy(cfg, requestMethod = "GET") {
  const head = requestMethod === "HEAD";
  if (cfg && cfg.decoyUrl && typeof cfg.decoyUrl === "string" && /^https:\/\//.test(cfg.decoyUrl)) {
    const cacheKey = new Request("https://pgdecoy.edge-cache.internal/" + sha256HexSync(cfg.decoyUrl));
    try {
      const hit = await caches.default.match(cacheKey);
      if (hit) {
        return new Response(head ? null : hit.body, { status: hit.status, headers: hit.headers });
      }
    } catch (_) { /* cache miss or unavailable */ }
    try {
      const upstream = await fetch(cfg.decoyUrl, {
        method: "GET",
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36" }
      });
      const headers = new Headers();
      headers.set("Content-Type", upstream.headers.get("Content-Type") || "text/html; charset=utf-8");
      headers.set("Cache-Control", "public, max-age=60");
      headers.set("X-Content-Type-Options", "nosniff");
      headers.set("Vary", "Accept-Encoding");
      const cached = new Response(upstream.body, { status: upstream.status, headers });
      const reply = cached.clone();
      try { await caches.default.put(cacheKey, cached); } catch (_) { /* best effort */ }
      return new Response(head ? null : reply.body, { status: reply.status, headers: reply.headers });
    } catch (_) { /* fall through to the built-in storefront */ }
  }
  const html = cfg && cfg.decoyHtml ? cfg.decoyHtml : brandifyDecoy(DECOY_TEMPLATE, { name: "LUXVEIL", initials: "LV", palette: { accent: "#92400e", dark: "#7c3309", light: "#fef3c7" }, products: [["Cashmere Overcoat", "Outerwear", "$385.00", ""], ["Relaxed Fit Blazer", "Tailoring", "$265.00", ""], ["Merino Turtleneck", "Knitwear", "$145.00", "$195.00"], ["Leather Crossbody Bag", "Accessories", "$220.00", ""]], cities: ["London", "Dubai", "Paris"] });
  const headers = {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-cache",
    "X-Content-Type-Options": "nosniff",
    "Vary": "Accept-Encoding"
  };
  return new Response(head ? null : html, { status: 200, headers });
}
