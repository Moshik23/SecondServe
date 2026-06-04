import React, { useState, useEffect } from "react";

export default function App() {
  const [view, setView] = useState("login"); // login, home, deals, vendor, dashboard, profile
  const [userType, setUserType] = useState(""); // customer, vendor
  const [surplusItems, setSurplusItems] = useState([]);
  const [systemMessage, setSystemMessage] = useState("");

  // Presentation Day AI Prototype States
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Dashboard stats
  const [stats, setStats] = useState({
    totalSaved: 24,
    totalDeals: 15,
    totalOrders: 18,
    moneySaved: 142.50
  });

  // Profile data
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    joinedDate: new Date().toLocaleDateString()
  });

  // Vendor Intake Form State
  const [vendorId, setVendorId] = useState("1");
  const [selectedItem, setSelectedItem] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  // Complete, unaltered sample food items array for the quick add grid
  const sampleItems = [
    { name: "Satay Ayam", category: "Meals", defaultPrice: 8.00, image: "🍢" },
    { name: "Ice Kacang", category: "Desserts", defaultPrice: 3.50, image: "🍧" },
    { name: "Char Kway Teow", category: "Meals", defaultPrice: 5.00, image: "🍜" },
    { name: "Hainanese Chicken Rice", category: "Meals", defaultPrice: 4.50, image: "🍗" },
    { name: "Laksa", category: "Meals", defaultPrice: 6.00, image: "🥣" },
    { name: "Roti Prata", category: "Meals", defaultPrice: 2.00, image: "🫓" },
    { name: "Nasi Lemak", category: "Meals", defaultPrice: 4.00, image: "🍚" },
    { name: "Teh Tarik", category: "Drinks", defaultPrice: 1.50, image: "☕" },
    { name: "Popiah", category: "Snacks", defaultPrice: 2.50, image: "🥬" },
    { name: "Mee Goreng", category: "Meals", defaultPrice: 4.00, image: "🍝" }
  ];

  const [cache, setCache] = useState({
    data: null,
    timestamp: null,
    ttl: 300000 // 5 minutes
  });

  const API_BASE_URL = "/api/v1/products";

  useEffect(() => {
    if (view === "deals") {
      fetchSurplusData();
    }
  }, [view]);

  const fetchSurplusData = async () => {
    try {
      const currentTime = Date.now();
      if (cache.data && cache.timestamp && (currentTime - cache.timestamp) < cache.ttl) {
        setSurplusItems(cache.data);
        return;
      }

      const response = await fetch(API_BASE_URL);
      const result = await response.json();
      if (result.status === "success") {
        setSurplusItems(result.data);
        setCache({
          data: result.data,
          timestamp: currentTime,
          ttl: cache.ttl
        });
      }
    } catch (error) {
      console.error("Failed to fetch cloud database.", error);
    }
  };

  const handleAiParsingHandshake = async () => {
    if (!aiInput.trim()) {
      alert("Please enter a colloquial hawker description phrase first.");
      return;
    }
    setAiLoading(true);
    setSystemMessage("Consulting GitHub Models AI Registry...");

    try {
      const response = await fetch("/api/v1/parser/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: aiInput })
      });

      if (!response.ok) throw new Error("API infrastructure response error.");

      const result = await response.json();
      if (result.status === "success") {
        const extracted = result.data;
        
        setSelectedItem(extracted.product_name);
        setOriginalPrice(extracted.original_price.toString());
        setDiscountPrice(extracted.discount_price.toString());
        setQuantity(extracted.quantity_available.toString());
        
        setSystemMessage(`SUCCESS: AI Extraction complete via ${result.source}! Form fields auto-populated.`);
      } else {
        setSystemMessage("ERROR: AI engine could not parse parameters safely.");
      }
    } catch (err) {
      setSystemMessage("CRITICAL: Drop detected on AI backend middleware context.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    setSystemMessage("Transmitting to Azure SQL...");

    const selectedItemData = sampleItems.find(item => item.name === selectedItem);
    
    const payload = {
      vendor_id: parseInt(vendorId),
      product_name: selectedItem,
      category: selectedItemData ? selectedItemData.category : "Meals",
      original_price: parseFloat(originalPrice) || 5.00,
      discount_price: parseFloat(discountPrice) || 2.50,
      quantity_available: parseInt(quantity) || 5,
      image_url: "/assets/default-food.jpg"
    };

    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.status === 201) {
        setSystemMessage("SUCCESS: Surplus listed on SecondServe Shelf!");
        setSelectedItem("");
        setOriginalPrice("");
        setDiscountPrice("");
        setQuantity("");
        setAiInput("");
        setCache({ data: null, timestamp: null, ttl: cache.ttl });
      } else {
        setSystemMessage("ERROR: Transaction rejected by backend.");
      }
    } catch (error) {
      setSystemMessage("CRITICAL: Network execution failure.");
    }
  };

  const handleQuickAdd = (itemName) => {
    const item = sampleItems.find(i => i.name === itemName);
    setSelectedItem(itemName);
    setOriginalPrice(item.defaultPrice.toString());
    setDiscountPrice((item.defaultPrice * 0.5).toString());
    setQuantity("5");
  };

  const handleLogin = (type) => {
    setUserType(type);
    setView("home");
    setProfile({
      name: type === "customer" ? "John Doe" : "Jane Smith (Hawker Vendor)",
      email: type === "customer" ? "john.doe@outlook.com" : "vendor.tan@gmail.com",
      joinedDate: new Date().toLocaleDateString()
    });
  };

  const styles = {
    container: { maxWidth: "480px", margin: "0 auto", background: "#FFF", minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", overflow: "hidden" },
    header: { background: "linear-gradient(135deg, #0078D4 0%, #106EBE 100%)", color: "#FFF", padding: "20px", textAlign: "center", fontWeight: "bold", fontSize: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
    content: { padding: "20px", flex: 1, overflowY: "auto" },
    card: { border: "1px solid #E1DFDD", padding: "16px", borderRadius: "12px", marginBottom: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
    tag: { background: "#DFF6DD", color: "#107C41", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", display: "inline-block", marginBottom: "10px" },
    title: { fontSize: "18px", fontWeight: "bold", marginBottom: "8px", color: "#323130" },
    priceRow: { display: "flex", gap: "12px", alignItems: "baseline", marginBottom: "8px" },
    newPrice: { color: "#D83B01", fontSize: "24px", fontWeight: "bold" },
    oldPrice: { textDecoration: "line-through", color: "#A19F9D", fontSize: "14px" },
    location: { color: "#605E5C", fontSize: "13px" },
    input: { width: "100%", padding: "14px", marginBottom: "16px", border: "2px solid #E1DFDD", borderRadius: "8px", fontSize: "15px", boxSizing: "border-box" },
    submitBtn: { width: "100%", padding: "16px", background: "linear-gradient(135deg, #107C41 0%, #0B5A2F 100%)", color: "#FFF", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 8px rgba(16, 124, 65, 0.3)", boxSizing: "border-box" },
    alert: { padding: "14px", textAlign: "center", marginBottom: "16px", fontSize: "14px", fontWeight: "bold", borderRadius: "8px" },
    alertSuccess: { background: "#DFF6DD", color: "#107C41" },
    alertError: { background: "#FDE7E9", color: "#A80000" },
    loginCard: { textAlign: "center", padding: "40px 20px" },
    roleBtn: { width: "100%", padding: "20px", marginBottom: "16px", border: "2px solid #E1DFDD", borderRadius: "12px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", background: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", boxSizing: "border-box" },
    quickAddGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "20px" },
quickAddItem: { padding: "16px", border: "2px solid #E1DFDD", borderRadius: "12px", textAlign: "center", cursor: "pointer", background: "#FFF" },
    bottomNav: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "480px", background: "#FFF", borderTop: "1px solid #E1DFDD", display: "flex", justifyContent: "space-around", padding: "12px 0", boxShadow: "0 -2px 8px rgba(0,0,0,0.05)" },
    navItem: { display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", color: "#605E5C", fontSize: "11px" },
    navItemActive: { color: "#0078D4" },
    navIcon: { fontSize: "24px", marginBottom: "4px" },
    statsCard: { background: "linear-gradient(135deg, #0078D4 0%, #106EBE 100%)", color: "#FFF", padding: "20px", borderRadius: "12px", marginBottom: "16px" },
    statValue: { fontSize: "32px", fontWeight: "bold", marginBottom: "4px" },
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "16px" },
    statBox: { background: "#F3F2F1", padding: "16px", borderRadius: "12px", textAlign: "center" },
    profileCard: { textAlign: "center", padding: "30px 20px", background: "linear-gradient(135deg, #0078D4 0%, #106EBE 100%)", color: "#FFF", borderRadius: "12px", marginBottom: "20px" },
    quickActionGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "20px" },
    quickActionCard: { padding: "20px", background: "#F3F2F1", borderRadius: "12px", textAlign: "center", cursor: "pointer" }
  };

  return (
    <div style={styles.container}>
      {view !== "login" && <div style={styles.header}>SecondServe</div>}
      <div style={{ ...styles.content, paddingBottom: view !== "login" ? "80px" : "20px" }}>
        
        {view === "login" ? (
          <div style={styles.loginCard}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🍽️</div>
            <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "12px" }}>Welcome to SecondServe</h1>
            <p style={{ color: "#605E5C", marginBottom: "32px" }}>Save food, save money, save the planet</p>
            <button style={styles.roleBtn} onClick={() => handleLogin("customer")}>
              <span>🛒</span> <span>I'm a Customer</span>
            </button>
            <button style={styles.roleBtn} onClick={() => handleLogin("vendor")}>
              <span>👨‍🍳</span> <span>I'm a Vendor</span>
            </button>
          </div>
        ) : view === "home" ? (
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>Welcome back, {profile.name}!</h2>
            <p style={{ color: "#605E5C", marginBottom: "20px" }}>Ready to rescue food or list surplus?</p>

            <div style={styles.quickActionGrid}>
              <div style={styles.quickActionCard} onClick={() => setView("deals")}>
                <div style={{ fontSize: "40px", marginBottom: "8px" }}>🎯</div>
                <div style={{ fontWeight: "bold" }}>View Deals</div>
              </div>
              {userType === "vendor" && (
                <div style={styles.quickActionCard} onClick={() => setView("vendor")}>
                  <div style={{ fontSize: "40px", marginBottom: "8px" }}>📝</div>
                  <div style={{ fontWeight: "bold" }}>List Surplus</div>
                </div>
              )}
              <div style={styles.quickActionCard} onClick={() => setView("dashboard")}>
                <div style={{ fontSize: "40px", marginBottom: "8px" }}>📊</div>
                <div style={{ fontWeight: "bold" }}>Dashboard</div>
              </div>
              <div style={styles.quickActionCard} onClick={() => setView("profile")}>
                <div style={{ fontSize: "40px", marginBottom: "8px" }}>👤</div>
                <div style={{ fontWeight: "bold" }}>Profile</div>
              </div>
            </div>
            <div style={styles.statsCard}>
              <div style={styles.statValue}>${stats.moneySaved.toFixed(2)}</div>
              <div style={{ fontSize: "14px", opacity: 0.9 }}>Your Impact Savings</div>
            </div>
          </div>
        ) : view === "deals" ? (
          <div>
            <h2 style={{ fontSize: "20px", marginBottom: "20px", fontWeight: "bold" }}>🎯 Today's Live Surplus Deals</h2>
            {surplusItems && surplusItems.length > 0 ? (
              surplusItems.map((item, idx) => {
                const sampleItem = sampleItems.find(si => si.name === (item.ProductName || item.product_name));
                return (
                  <div key={idx} style={styles.card}>
                    <div style={{ fontSize: "48px", marginBottom: "12px", textAlign: "center" }}>{sampleItem ? sampleItem.image : "🍱"}</div>
                    <span style={styles.tag}>{item.Quantity || item.quantity_available || 0} portions left</span>
                    <div style={styles.title}>{item.ProductName || item.product_name}</div>
                    <div style={styles.priceRow}>
                      <span style={styles.newPrice}>${(item.DiscountPrice || item.discount_price || 0).toFixed(2)}</span>
                      <span style={styles.oldPrice}>Original ${(item.OriginalPrice || item.original_price || 0).toFixed(2)}</span>
                    </div>
                    <div style={{ color: "#605E5C", fontSize: "13px" }}>📍 {item.Location || "Singapore Hawker Center"}</div>
                  </div>
                );
              })
            ) : (
              <div style={styles.alert}>No active surplus food listed right now. Check back soon!</div>
            )}
          </div>
        ) : view === "vendor" ? (
          <div>
            <h2 style={{ fontSize: "20px", marginBottom: "20px", fontWeight: "bold" }}>📝 List Your Surplus</h2>
            
            {systemMessage && (
              <div style={{ ...styles.alert, ...(systemMessage.includes("SUCCESS") ? styles.alertSuccess : styles.alertError) }}>
                {systemMessage}
              </div>
            )}

            <div style={{ background: "#F3F2F1", padding: "16px", borderRadius: "12px", marginBottom: "24px", border: "2px dashed #0078D4" }}>
              <label style={{ fontSize: "14px", fontWeight: "bold", color: "#0078D4", marginBottom: "8px", display: "block" }}>
                🤖 Uncle Tan's Conversational AI Lister
              </label>
              <textarea
                style={{ width: "100%", height: "65px", padding: "10px", marginBottom: "10px", border: "1px solid #A19F9D", borderRadius: "8px", fontSize: "14px", resize: "none", fontFamily: "inherit" }}
                placeholder="Type Singlish description... e.g., Got 12 packets of Fish Soup left, let go at 4 bucks each, original was 7.50"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
              />
              <button type="button" style={{ ...styles.submitBtn, padding: "12px", background: "linear-gradient(135deg, #0078D4 0%, #106EBE 100%)", boxShadow: "none", fontSize: "14px" }} onClick={handleAiParsingHandshake} disabled={aiLoading}>
                {aiLoading ? "Consulting GPT-4o-Mini..." : "✨ Auto-Fill Form via AI"}
              </button>
            </div>

            <p style={{ fontSize: "14px", color: "#605E5C", marginBottom: "16px" }}>Quick Add - Tap to pre-fill:</p>
            <div style={styles.quickAddGrid}>
              {/* Restored to display the full, unrestricted 10-item list array seamlessly */}
              {sampleItems.map((item, idx) => (
                <div key={idx} style={styles.quickAddItem} onClick={() => handleQuickAdd(item.name)}>
                  <div style={{ fontSize: "40px", marginBottom: "8px" }}>{item.image}</div>
                  <div style={{ fontSize: "14px", fontWeight: "bold" }}>{item.name}</div>
                  <div style={{ fontSize: "12px", color: "#605E5C" }}>${item.defaultPrice.toFixed(2)}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleVendorSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "14px", fontWeight: "bold", display: "block", marginBottom: "8px" }}>Selected Item</label>
                <select style={styles.input} value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)} required>
                  <option value="">Select an item...</option>
                  {sampleItems.map((item, idx) => (
                    <option key={idx} value={item.name}>{item.image} {item.name}</option>
                  ))}
                  {selectedItem && !sampleItems.some(i => i.name === selectedItem) && (
                    <option value={selectedItem}>✨ {selectedItem}</option>
                  )}
                </select>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "14px", fontWeight: "bold", display: "block", marginBottom: "8px" }}>Original Price ($)</label>
                  <input type="number" step="0.01" style={styles.input} value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "14px", fontWeight: "bold", display: "block", marginBottom: "8px" }}>Discount Price ($)</label>
                  <input type="number" step="0.01" style={styles.input} value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} required />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "14px", fontWeight: "bold", display: "block", marginBottom: "8px" }}>Quantity Available</label>
                <input type="number" style={styles.input} value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
              </div>

              <button type="submit" style={styles.submitBtn}>🚀 List to SecondServe Shelf</button>
            </form>
          </div>
        ) : view === "dashboard" ? (
          <div>
            <h2 style={{ fontSize: "20px", marginBottom: "20px", fontWeight: "bold" }}>📊 Carbon & Savings Analytics Dashboard</h2>
            <div style={styles.statsCard}>
              <div style={styles.statValue}>${stats.moneySaved.toFixed(2)}</div>
              <div style={{ fontSize: "14px", opacity: 0.9 }}>Total Financial Waste Prevented</div>
            </div>
            <div style={styles.statsGrid}>
              <div style={styles.statBox}>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: "#0078D4" }}>{stats.totalSaved}</div>
                <div style={{ fontSize: "12px", color: "#605E5C" }}>Meals Saved from Bin</div>
              </div>
              <div style={styles.statBox}>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: "#0078D4" }}>{(stats.totalSaved * 2.5).toFixed(1)} kg</div>
                <div style={{ fontSize: "12px", color: "#605E5C" }}>CO2 Emissions Prevented</div>
              </div>
            </div>
          </div>
        ) : view === "profile" ? (
          <div>
            <h2 style={{ fontSize: "20px", marginBottom: "20px", fontWeight: "bold" }}>👤 User Security & Profile Matrix</h2>
            <div style={styles.profileCard}>
              <div style={{ fontSize: "64px", marginBottom: "12px" }}>👤</div>
              <div style={{ fontSize: "24px", fontWeight: "bold" }}>{profile.name}</div>
              <div style={{ fontSize: "14px", opacity: 0.9 }}>{profile.email}</div>
            </div>
            <div style={styles.card}>
              <div style={{ fontWeight: "bold", marginBottom: "4px" }}>Account Tier</div>
              <div style={{ fontSize: "14px", color: "#605E5C" }}>SkillsFuture Pilot Subscription Node</div>
            </div>
            <button style={{ ...styles.submitBtn, background: "#A80000", marginTop: "20px" }} onClick={() => { setView("login"); setUserType(""); }}>
              Log Out Secure Session
            </button>
          </div>
        ) : null}
        
      </div>

      {view !== "login" && (
        <div style={styles.bottomNav}>
          <div style={{ ...styles.navItem, ...(view === "home" ? styles.navItemActive : {}) }} onClick={() => setView("home")}>
            <div style={styles.navIcon}>🏠</div> <div>Home</div>
          </div>
          <div style={{ ...styles.navItem, ...(view === "deals" ? styles.navItemActive : {}) }} onClick={() => setView("deals")}>
            <div style={styles.navIcon}>🎯</div> <div>Deals</div>
          </div>
{userType === "vendor" && (
            <div style={{ ...styles.navItem, ...(view === "vendor" ? styles.navItemActive : {}) }} onClick={() => setView("vendor")}>
              <div style={styles.navIcon}>📝</div>
              <div>List</div>
            </div>
          )}
          <div style={{ ...styles.navItem, ...(view === "dashboard" ? styles.navItemActive : {}) }} onClick={() => setView("dashboard")}>
            <div style={styles.navIcon}>📊</div>
            <div>Stats</div>
          </div>
          <div style={{ ...styles.navItem, ...(view === "profile" ? styles.navItemActive : {}) }} onClick={() => setView("profile")}>
            <div style={styles.navIcon}>👤</div>
            <div>Profile</div>
          </div>
        </div>
      )}
    </div>
  );
}
