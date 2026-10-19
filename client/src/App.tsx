import { useEffect, useState } from "react";
import { ApiError } from "./lib/api";
import {
  getCategories,
  getProductById,
  getProducts,
} from "./features/products/product.api";
import type {
  Category,
  Product,
  ProductPagination,
  ProductQuery,
} from "./types/product";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
} from "./features/cart/cart.api";

import type { Cart } from "./features/cart/cart.api";
import "./App.css";
import AuthForm from "./features/auth/AuthForm";
import { logoutUser, type AuthResult } from "./features/auth/auth.api";

const EMPTY_PAGINATION: ProductPagination = {
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

function getCategoryName(category: Product["category"]): string {
  return typeof category === "string" ? category : category.name;
}

function getAvailableStock(product: Product): number {
  return Math.max(0, product.stock - product.reservedStock);
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(price);
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] =
    useState<ProductPagination>(EMPTY_PAGINATION);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<ProductQuery["sort"]>("newest");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadProducts, setReloadProducts] = useState(0);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [authResult, setAuthResult] = useState<AuthResult | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authNotice, setAuthNotice] = useState("");

  const [cart, setCart] = useState<Cart | null>(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState("");
  const [cartNotice, setCartNotice] = useState("");
  const [cartBusyProductId, setCartBusyProductId] = useState<string | null>(
    null,
  );
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    if (!cartNotice) return;

    const timeoutId = window.setTimeout(() => {
      setCartNotice("");
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [cartNotice]);

  // Load categories once.
  useEffect(() => {
    let ignore = false;

    getCategories()
      .then((result) => {
        if (!ignore) {
          setCategories(result.filter((item) => item.isActive));
        }
      })
      .catch((err: unknown) => {
        console.error("Could not load categories:", err);
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Reload products when filters or pagination change.
  useEffect(() => {
    let ignore = false;

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const result = await getProducts({
          search: search || undefined,
          category: category || undefined,
          sort,
          page,
          limit: 12,
        });

        if (!ignore) {
          setProducts(result.products);
          setPagination(result.pagination);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setProducts([]);
          setPagination(EMPTY_PAGINATION);
          setError(
            err instanceof ApiError
              ? err.message
              : "Something went wrong while loading products.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      ignore = true;
    };
  }, [search, category, sort, page, reloadProducts]);

  useEffect(() => {
    if (!authResult) return;

    let ignore = false;
    const accessToken = authResult.accessToken;

    async function loadCart() {
      try {
        const result = await getCart(accessToken);

        if (!ignore) {
          setCart(result);
          setCartError("");
        }
      } catch (err: unknown) {
        if (!ignore) {
          setCartError(
            err instanceof ApiError ? err.message : "Could not load your cart.",
          );
        }
      } finally {
        if (!ignore) {
          setCartLoading(false);
        }
      }
    }

    void loadCart();

    return () => {
      ignore = true;
    };
  }, [authResult]);

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function handleCategoryChange(value: string) {
    setCategory(value);
    setPage(1);
  }

  function handleSortChange(value: ProductQuery["sort"]) {
    setSort(value);
    setPage(1);
  }

  async function handleViewProduct(productId: string) {
    setSelectedProduct(null);
    setDetailError("");
    setDetailLoading(true);

    try {
      const product = await getProductById(productId);
      setSelectedProduct(product);
    } catch (err: unknown) {
      setDetailError(
        err instanceof ApiError
          ? err.message
          : "Could not load product details.",
      );
    } finally {
      setDetailLoading(false);
    }
  }

  function handleAuthenticated(result: AuthResult) {
    setAuthResult(result);
    setCartLoading(true);
    setCartError("");
    setCartNotice("");
    setShowAuthModal(false);
    setAuthNotice(`Welcome, ${result.user.name}!`);
  }

  async function handleAddToCart(product: Product) {
    if (!authResult) {
      setAuthNotice("Sign in to add products to your cart.");
      setShowAuthModal(true);
      return;
    }

    setCartBusyProductId(product._id);
    setCartError("");
    setCartNotice("");

    try {
      const updatedCart = await addToCart(
        authResult.accessToken,
        product._id,
        1,
      );

      setCart(updatedCart);
      setCartNotice(`${product.name} added to your cart.`);
    } catch (err: unknown) {
      setCartNotice("");
      setCartError(
        err instanceof ApiError
          ? err.message
          : "Could not add this product. Please try again.",
      );
    } finally {
      setCartBusyProductId(null);
    }
  }

  async function handleUpdateCartItem(productId: string, quantity: number) {
    if (!authResult) return;

    setCartBusyProductId(productId);
    setCartError("");

    try {
      const updatedCart = await updateCartItem(
        authResult.accessToken,
        productId,
        quantity,
      );
      setCart(updatedCart);
    } catch (err: unknown) {
      setCartError(
        err instanceof ApiError ? err.message : "Could not update your cart.",
      );
    } finally {
      setCartBusyProductId(null);
    }
  }

  async function handleRemoveCartItem(productId: string) {
    if (!authResult) return;

    setCartBusyProductId(productId);
    setCartError("");

    try {
      const updatedCart = await removeCartItem(
        authResult.accessToken,
        productId,
      );
      setCart(updatedCart);
      setCartNotice("Item removed from your cart.");
    } catch (err: unknown) {
      setCartError(
        err instanceof ApiError ? err.message : "Could not remove this item.",
      );
    } finally {
      setCartBusyProductId(null);
    }
  }

  async function handleLogout() {
    const currentSession = authResult;

    // Clear the local session even if the backend logout fails.
    setAuthResult(null);
    setAuthNotice("You have signed out.");
    setShowAuthModal(false);
    setCart(null);
    setCartError("");
    setCartNotice("");
    setCartLoading(false);
    setShowCart(false);

    if (currentSession) {
      try {
        await logoutUser(
          currentSession.refreshToken,
          currentSession.accessToken,
        );
      } catch (err: unknown) {
        console.error("Server logout failed:", err);
        setAuthNotice(
          "Signed out locally. Server-side logout needs verification.",
        );
      }
    }
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Indigo Store home">
          <span className="brand-mark">i.</span>
          <span>
            indigo<span className="brand-light">store</span>
          </span>
        </a>

        <nav className="header-nav" aria-label="Main navigation">
          <a className="nav-active" href="#products">
            Shop
          </a>
          <a href="#categories">Categories</a>
        </nav>

        <div className="header-actions">
          <span className="header-status">
            <span className="status-dot" />
            {authResult ? "Signed in" : "Storefront"}
          </span>

          {authResult ? (
            <button
              className="cart-button"
              type="button"
              onClick={() => void handleLogout()}
            >
              Sign out
            </button>
          ) : (
            <button
              className="cart-button"
              type="button"
              onClick={() => setShowAuthModal(true)}
            >
              Sign in
            </button>
          )}

          {authResult && (
            <button
              className="cart-button"
              type="button"
              onClick={() => {
                setShowCart(true);
                setCartError("");
              }}
            >
              Cart (
              {cart?.items.reduce((total, item) => total + item.quantity, 0) ??
                0}
              )
            </button>
          )}
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="eyebrow-line" />
              YOUR EVERYDAY DISCOVERIES
            </span>

            <h1>
              Good finds.
              <br />
              <span>Better living.</span>
            </h1>

            <p>
              Thoughtfully selected essentials for your everyday life. Find
              something you’ll love.
            </p>

            <a className="hero-cta" href="#products">
              Explore products <span aria-hidden="true">↘</span>
            </a>

            <div className="hero-note">
              <span className="hero-note-icon">✳</span>
              Discover your next favourite
            </div>
          </div>

          <div className="hero-visual" aria-label="Product collection artwork">
            <div className="visual-orbit orbit-one" />
            <div className="visual-orbit orbit-two" />
            <div className="visual-glow" />
            <div className="visual-card visual-card-back">
              <span>LESS, BUT BETTER</span>
              <div className="visual-shape shape-back" />
            </div>
            <div className="visual-card visual-card-front">
              <span className="visual-card-label">THE DAILY EDIT</span>
              <div className="visual-shape shape-front" />
              <span className="visual-card-bottom">
                Made for your everyday.
              </span>
            </div>
            <span className="visual-spark spark-one">✳</span>
            <span className="visual-spark spark-two">✦</span>
            <span className="visual-index">01 / DISCOVER</span>
          </div>

          <div className="hero-decoration" aria-hidden="true">
            01
          </div>
        </section>

        <section className="catalogue" id="products">
          <div className="section-heading">
            <div>
              <span className="section-kicker">THE COLLECTION</span>
              <h2>Find your next favourite.</h2>
              <p>Explore the collection, one good find at a time.</p>
            </div>

            <span className="result-count">
              {loading ? "Loading…" : `${pagination.total} products`}
            </span>
          </div>

          <div className="catalogue-toolbar">
            <form className="search-form" onSubmit={handleSearch}>
              <span className="search-icon" aria-hidden="true">
                ⌕
              </span>
              <input
                id="product-search"
                name="search"
                aria-label="Search products"
                placeholder="Search products..."
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
              {searchInput && (
                <button
                  className="clear-search"
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                    setPage(1);
                  }}
                >
                  ×
                </button>
              )}
              <button className="search-submit" type="submit">
                Search
              </button>
            </form>

            <label className="sort-control">
              <span>Sort by</span>
              <select
                id="product-sort"
                name="sort"
                value={sort}
                onChange={(event) =>
                  handleSortChange(event.target.value as ProductQuery["sort"])
                }
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price_asc">Price: Low to high</option>
                <option value="price_desc">Price: High to low</option>
                <option value="name_asc">Name: A–Z</option>
                <option value="name_desc">Name: Z–A</option>
              </select>
            </label>
          </div>

          <div className="catalogue-layout">
            <aside className="category-sidebar" id="categories">
              <h3>Categories</h3>
              <p className="sidebar-description">Browse by what you need.</p>

              <button
                className={`category-option ${category === "" ? "selected" : ""}`}
                type="button"
                onClick={() => handleCategoryChange("")}
              >
                <span>All products</span>
                <span aria-hidden="true">→</span>
              </button>

              {categories.map((item) => (
                <button
                  className={`category-option ${category === item._id ? "selected" : ""}`}
                  type="button"
                  key={item._id}
                  onClick={() => handleCategoryChange(item._id)}
                >
                  <span>{item.name}</span>
                  {category === item._id && <span aria-hidden="true">→</span>}
                </button>
              ))}
            </aside>

            <div className="product-area">
              {error && (
                <div className="state-panel error-panel" role="alert">
                  <span className="state-icon">!</span>
                  <h3>We couldn’t load the collection.</h3>
                  <p>{error}</p>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => setReloadProducts((current) => current + 1)}
                  >
                    Retry
                  </button>
                </div>
              )}

              {loading && (
                <div className="product-grid" aria-label="Loading products">
                  {Array.from({ length: 6 }, (_, index) => (
                    <div className="product-skeleton" key={index}>
                      <div className="skeleton-image" />
                      <div className="skeleton-line" />
                      <div className="skeleton-line short" />
                    </div>
                  ))}
                </div>
              )}

              {!loading && !error && products.length === 0 && (
                <div className="state-panel">
                  <span className="state-icon">⌕</span>
                  <h3>No products found</h3>
                  <p>Try a different search or select another category.</p>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      setSearch("");
                      setCategory("");
                      setSort("newest");
                      setPage(1);
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}

              {!loading && !error && products.length > 0 && (
                <div className="product-grid">
                  {products.map((product) => {
                    const available = getAvailableStock(product);

                    return (
                      <article className="product-card" key={product._id}>
                        <div className="product-image">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              loading="lazy"
                            />
                          ) : (
                            <div className="image-placeholder">
                              <span className="placeholder-symbol">✳</span>
                              <span>INDIGO / ESSENTIALS</span>
                            </div>
                          )}

                          <span
                            className={`stock-badge ${available > 0 ? "in-stock" : "out-of-stock"}`}
                          >
                            {available > 0 ? "In stock" : "Sold out"}
                          </span>
                        </div>

                        <div className="product-details">
                          <span className="product-category">
                            {getCategoryName(product.category)}
                          </span>
                          <h3>{product.name}</h3>
                          <p className="product-description">
                            {product.description}
                          </p>

                          <div className="product-card-footer">
                            <span className="product-price">
                              {formatPrice(product.price)}
                            </span>
                            <button
                              className="product-add"
                              type="button"
                              disabled={available <= 0}
                              aria-label={`View ${product.name}`}
                              onClick={() =>
                                void handleViewProduct(product._id)
                              }
                            >
                              {available > 0 ? "+" : "—"}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {!loading && !error && pagination.totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="secondary-button"
                    type="button"
                    disabled={!pagination.hasPreviousPage}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    ← Previous
                  </button>

                  <span>
                    Page {pagination.page} of {pagination.totalPages}
                  </span>

                  <button
                    className="secondary-button"
                    type="button"
                    disabled={!pagination.hasNextPage}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {showAuthModal && (
        <div className="modal-backdrop" onClick={() => setShowAuthModal(false)}>
          <div onClick={(event) => event.stopPropagation()}>
            <AuthForm
              onAuthenticated={handleAuthenticated}
              onCancel={() => setShowAuthModal(false)}
            />
          </div>
        </div>
      )}

      {authNotice && (
        <div className="auth-notice" role="status">
          <span>{authNotice}</span>
          <button
            type="button"
            onClick={() => setAuthNotice("")}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}

      {(detailLoading || detailError || selectedProduct) && (
        <div
          className="modal-backdrop"
          onClick={() => {
            if (!detailLoading) {
              setSelectedProduct(null);
              setDetailError("");
            }
          }}
        >
          <section
            className="product-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              type="button"
              aria-label="Close product details"
              disabled={detailLoading}
              onClick={() => {
                setSelectedProduct(null);
                setDetailError("");
              }}
            >
              ×
            </button>

            {detailLoading && <p>Loading product details…</p>}

            {detailError && (
              <div role="alert">
                <h2>Could not load product</h2>
                <p>{detailError}</p>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => setDetailError("")}
                >
                  Close
                </button>
              </div>
            )}

            {selectedProduct && (
              <div className="modal-product-content">
                <div className="modal-product-image">
                  {selectedProduct.imageUrl ? (
                    <img
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.name}
                    />
                  ) : (
                    <div className="image-placeholder">
                      <span className="placeholder-symbol">✳</span>
                      <span>INDIGO / ESSENTIALS</span>
                    </div>
                  )}
                </div>

                <div className="modal-product-info">
                  <span className="product-category">
                    {getCategoryName(selectedProduct.category)}
                  </span>
                  <h2 id="product-modal-title">{selectedProduct.name}</h2>
                  <p>{selectedProduct.description}</p>
                  <strong className="modal-product-price">
                    {formatPrice(selectedProduct.price)}
                  </strong>

                  <p className="modal-stock">
                    {getAvailableStock(selectedProduct) > 0
                      ? `${getAvailableStock(selectedProduct)} available`
                      : "Currently out of stock"}
                  </p>

                  {cartNotice && (
                    <p className="cart-success-message" role="status">
                      ✓ {cartNotice}
                    </p>
                  )}

                  {cartError && (
                    <p className="cart-error-message" role="alert">
                      {cartError}
                    </p>
                  )}

                  <button
                    className="modal-primary-button"
                    type="button"
                    disabled={
                      getAvailableStock(selectedProduct) <= 0 ||
                      cartBusyProductId === selectedProduct._id
                    }
                    onClick={() => void handleAddToCart(selectedProduct)}
                  >
                    {cartBusyProductId === selectedProduct._id
                      ? "Adding…"
                      : "Add to cart"}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {showCart && (
        <div className="modal-backdrop" onClick={() => setShowCart(false)}>
          <section
            className="product-modal cart-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              type="button"
              aria-label="Close cart"
              onClick={() => setShowCart(false)}
            >
              ×
            </button>

            <h2 id="cart-modal-title">Your cart</h2>

            {cartLoading && <p>Loading your cart…</p>}

            {cartError && <p role="alert">{cartError}</p>}

            {cartNotice && <p role="status">{cartNotice}</p>}

            {!cartLoading && cart && cart.items.length === 0 && (
              <p>Your cart is empty.</p>
            )}

            {!cartLoading && cart && cart.items.length > 0 && (
              <>
                <div className="cart-items">
                  {cart.items.map((item) => {
                    const productId = item.product._id;
                    const busy = cartBusyProductId === productId;

                    return (
                      <article className="cart-item" key={productId}>
                        <div className="cart-item-info">
                          <strong>{item.product.name}</strong>
                          <span>{formatPrice(item.product.price)} each</span>
                          <span>
                            Line total:{" "}
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>

                        <div className="cart-item-actions">
                          <button
                            className="secondary-button"
                            type="button"
                            aria-label={`Decrease ${item.product.name} quantity`}
                            disabled={busy || item.quantity <= 1}
                            onClick={() =>
                              void handleUpdateCartItem(
                                productId,
                                item.quantity - 1,
                              )
                            }
                          >
                            −
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            className="secondary-button"
                            type="button"
                            aria-label={`Increase ${item.product.name} quantity`}
                            disabled={
                              busy ||
                              item.quantity >= getAvailableStock(item.product)
                            }
                            onClick={() =>
                              void handleUpdateCartItem(
                                productId,
                                item.quantity + 1,
                              )
                            }
                          >
                            +
                          </button>

                          <button
                            className="secondary-button"
                            type="button"
                            disabled={busy}
                            onClick={() => void handleRemoveCartItem(productId)}
                          >
                            Remove
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <div className="cart-subtotal">
                  <strong>Subtotal</strong>
                  <strong>
                    {formatPrice(
                      cart.items.reduce(
                        (total, item) =>
                          total + item.product.price * item.quantity,
                        0,
                      ),
                    )}
                  </strong>
                </div>
              </>
            )}
          </section>
        </div>
      )}

      <footer className="site-footer">
        <a className="brand footer-brand" href="/">
          <span className="brand-mark">i.</span>
          <span>
            indigo<span className="brand-light">store</span>
          </span>
        </a>
        <span>Thoughtful finds for everyday living.</span>
        <span>Built with care · © {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}

export default App;
