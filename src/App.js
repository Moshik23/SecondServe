import React, { useState, useEffect } from "react";

export default function App() {
  const [view, setView] = useState("login"); // login, home, deals, vendor, dashboard, profile
  const [userType, setUserType] = useState(""); // customer, vendor
  const [surplusItems, setSurplusItems] = useState([]);
  const [systemMessage, setSystemMessage] = useState("");

  // Dashboard stats
  const [stats, setStats] = useState({
    totalSaved: 0,
    totalDeals: 0,
    totalOrders: 0,
    moneySaved: 0
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

  // Sample food items for one-tap vendor flow
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

  // Application-level cache for API responses
  const [cache, setCache] = useState({
    data: null,
    timestamp: null,
    ttl: 300000 // 5 minutes in milliseconds
  });

  // Use relative URLs for production
  const API_BASE_URL = "/api/v1/products";

  useEffect(() => {
    if (view === "deals") {
      fetchSurplusData();
    }
  }, [view]);

  const fetchSurplusData = async () => {
    try {
      // Check cache first
      const currentTime = Date.now();
      if (cache.data && cache.timestamp && (currentTime - cache.timestamp) < cache.ttl) {
        console.log("Using cached data");
        setSurplusItems(cache.data);
        return;
      }

      // Cache miss or expired, fetch from API
      const response = await fetch(API_BASE_URL);
      const result = await response.json();
      if (result.status === "success") {
        setSurplusItems(result.data);
        // Update cache
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

  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    setSystemMessage("Transmitting to Azure SQL...");

    const selectedItemData = sampleItems.find(item => item.name === selectedItem);
    const payload = {
      vendor_id: parseInt(vendorId),
      product_name: selectedItemData.name,
      category: selectedItemData.category,
      original_price: parseFloat(originalPrice) || selectedItemData.defaultPrice,
      discount_price: parseFloat(discountPrice) || (selectedItemData.defaultPrice * 0.5),
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
        // Invalidate cache after creating new product
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
    // Simulate stats calculation
    setStats({
      totalSaved: Math.floor(Math.random() * 50) + 10,
      totalDeals: surplusItems.length || Math.floor(Math.random() * 20) + 5,
      totalOrders: Math.floor(Math.random() * 30) + 5,
      moneySaved: Math.floor(Math.random() * 200) + 50
    });
    setProfile({
      name: type === "customer" ? "John Doe" : "Jane Smith",
      email: type === "customer" ? "john@example.com" : "jane@example.com",
      joinedDate: new Date().toLocaleDateString()
    });
  };

  const styles = {
    container: { maxWidth: "480px", margin: "0 auto", background: "#FFF", minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
    header: { background: "linear-gradient(135deg, #0078D4 0%, #106EBE 100%)", color: "#FFF", padding: "20px", textAlign: "center", fontWeight: "bold", fontSize: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
    content: { padding: "20px", flex: 1, overflowY: "auto" },
    card: { border: "1px solid #E1DFDD", padding: "16px", borderRadius: "12px", marginBottom: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", transition: "transform 0.2s", cursor: "pointer" },
    cardHover: { transform: "translateY(-2px)", boxShadow: "0 4px 12px rgba(0,0,0,0.12)" },
    tag: { background: "#DFF6DD", color: "#107C41", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", display: "inline-block", marginBottom: "10px" },
    title: { fontSize: "18px", fontWeight: "bold", marginBottom: "8px", color: "#323130" },
    priceRow: { display: "flex", gap: "12px", alignItems: "baseline", marginBottom: "8px" },
    newPrice: { color: "#D83B01", fontSize: "24px", fontWeight: "bold" },
    oldPrice: { textDecoration: "line-through", color: "#A19F9D", fontSize: "14px" },
    location: { color: "#605E5C", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" },
    input: { width: "100%", padding: "14px", marginBottom: "16px", border: "2px solid #E1DFDD", borderRadius: "8px", fontSize: "15px", transition: "border-color 0.2s" },
    inputFocus: { borderColor: "#0078D4", outline: "none" },
    submitBtn: { width: "100%", padding: "16px", background: "linear-gradient(135deg, #107C41 0%, #0B5A2F 100%)", color: "#FFF", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 8px rgba(16, 124, 65, 0.3)", transition: "transform 0.2s" },
    submitBtnHover: { transform: "scale(1.02)" },
    alert: { padding: "14px", background: "#F3F2F1", textAlign: "center", marginBottom: "16px", fontSize: "14px", fontWeight: "bold", borderRadius: "8px" },
    alertSuccess: { background: "#DFF6DD", color: "#107C41" },
    alertError: { background: "#FDE7E9", color: "#A80000" },
    loginCard: { textAlign: "center", padding: "40px 20px" },
    loginTitle: { fontSize: "28px", fontWeight: "bold", marginBottom: "12px", color: "#323130" },
    loginSubtitle: { fontSize: "16px", color: "#605E5C", marginBottom: "32px" },
    roleBtn: { width: "100%", padding: "20px", marginBottom: "16px", border: "2px solid #E1DFDD", borderRadius: "12px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", background: "#FFF", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" },
    roleBtnHover: { borderColor: "#0078D4", background: "#F3F2F1" },
    roleIcon: { fontSize: "32px" },
    quickAddGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "20px" },
    quickAddItem: { padding: "16px", border: "2px solid #E1DFDD", borderRadius: "12px", textAlign: "center", cursor: "pointer", transition: "all 0.2s", background: "#FFF" },
    quickAddItemHover: { borderColor: "#0078D4", background: "#F3F2F1", transform: "scale(1.05)" },
    quickAddIcon: { fontSize: "40px", marginBottom: "8px" },
    quickAddName: { fontSize: "14px", fontWeight: "bold", color: "#323130" },
    quickAddPrice: { fontSize: "12px", color: "#605E5C" },
    backButton: { padding: "12px 20px", background: "#F3F2F1", color: "#323130", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "bold", cursor: "pointer", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" },
    foodEmoji: { fontSize: "48px", marginBottom: "12px" },
    bottomNav: { position: "fixed", bottom: 0, left: 0, right: 0, background: "#FFF", borderTop: "1px solid #E1DFDD", display: "flex", justifyContent: "space-around", padding: "12px 0", boxShadow: "0 -2px 8px rgba(0,0,0,0.05)" },
    navItem: { display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", color: "#605E5C", transition: "color 0.2s", fontSize: "11px" },
    navItemActive: { color: "#0078D4" },
    navIcon: { fontSize: "24px", marginBottom: "4px" },
    statsCard: { background: "linear-gradient(135deg, #0078D4 0%, #106EBE 100%)", color: "#FFF", padding: "20px", borderRadius: "12px", marginBottom: "16px", boxShadow: "0 4px 12px rgba(0,120,212,0.3)" },
    statValue: { fontSize: "32px", fontWeight: "bold", marginBottom: "4px" },
    statLabel: { fontSize: "14px", opacity: 0.9 },
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "16px" },
    statBox: { background: "#F3F2F1", padding: "16px", borderRadius: "12px", textAlign: "center" },
    statBoxValue: { fontSize: "24px", fontWeight: "bold", color: "#0078D4", marginBottom: "4px" },
    statBoxLabel: { fontSize: "12px", color: "#605E5C" },
    profileCard: { textAlign: "center", padding: "30px 20px", background: "linear-gradient(135deg, #0078D4 0%, #106EBE 100%)", color: "#FFF", borderRadius: "12px", marginBottom: "20px" },
    profileAvatar: { fontSize: "64px", marginBottom: "12px" },
    profileName: { fontSize: "24px", fontWeight: "bold", marginBottom: "4px" },
    profileEmail: { fontSize: "14px", opacity: 0.9 },
    profileSection: { marginBottom: "20px" },
    profileSectionTitle: { fontSize: "14px", fontWeight: "bold", color: "#605E5C", marginBottom: "12px", textTransform: "uppercase" },
    profileItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "#FFF", border: "1px solid #E1DFDD", borderRadius: "8px", marginBottom: "8px", cursor: "pointer" },
    homeWelcome: { fontSize: "24px", fontWeight: "bold", marginBottom: "8px", color: "#323130" },
    homeSubtitle: { fontSize: "14px", color: "#605E5C", marginBottom: "20px" },
    quickActionGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "20px" },
    quickActionCard: { padding: "20px", background: "#F3F2F1", borderRadius: "12px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" },
    quickActionCardHover: { background: "#E1DFDD", transform: "scale(1.02)" },
    quickActionIcon: { fontSize: "40px", marginBottom: "8px" },
    quickActionLabel: { fontSize: "14px", fontWeight: "bold", color: "#323130" }
  };

  return (
    <div style={styles.container}>
      {view !== "login" && <div style={styles.header}>SecondServe</div>}
      <div style={{ ...styles.content, paddingBottom: view !== "login" ? "80px" : "20px" }}>
        {view === "login" ? (
          <div style={styles.loginCard}>
            <div style={styles.foodEmoji}>🍽️</div>
            <h1 style={styles.loginTitle}>Welcome to SecondServe</h1>
            <p style={styles.loginSubtitle}>Save food, save money, save the planet</p>
            
            <button 
              style={styles.roleBtn} 
              onClick={() => handleLogin("customer")}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "#0078D4"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "#E1DFDD"}
            >
              <span style={styles.roleIcon}>🛒</span>
              <span>I'm a Customer</span>
            </button>
            
            <button 
              style={styles.roleBtn} 
              onClick={() => handleLogin("vendor")}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "#0078D4"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "#E1DFDD"}
            >
              <span style={styles.roleIcon}>👨‍🍳</span>
              <span>I'm a Vendor</span>
            </button>
          </div>
        ) : view === "home" ? (
          <div>
            <h2 style={styles.homeWelcome}>Welcome back, {profile.name}!</h2>
            <p style={styles.homeSubtitle}>Ready to save some food today?</p>
            
            <div style={styles.quickActionGrid}>
              <div 
                style={styles.quickActionCard}
                onClick={() => setView("deals")}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#E1DFDD"; e.currentTarget.style.transform = "scale(1.02)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#F3F2F1"; e.currentTarget.style.transform = "scale(1)"; }}
              >
                <div style={styles.quickActionIcon}>🎯</div>
                <div style={styles.quickActionLabel}>View Deals</div>
              </div>
              <div 
                style={styles.quickActionCard}
                onClick={() => setView("vendor")}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#E1DFDD"; e.currentTarget.style.transform = "scale(1.02)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#F3F2F1"; e.currentTarget.style.transform = "scale(1)"; }}
              >
                <div style={styles.quickActionIcon}>📝</div>
                <div style={styles.quickActionLabel}>List Surplus</div>
              </div>
              <div 
                style={styles.quickActionCard}
                onClick={() => setView("dashboard")}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#E1DFDD"; e.currentTarget.style.transform = "scale(1.02)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#F3F2F1"; e.currentTarget.style.transform = "scale(1)"; }}
              >
                <div style={styles.quickActionIcon}>📊</div>
                <div style={styles.quickActionLabel}>Dashboard</div>
              </div>
              <div 
                style={styles.quickActionCard}
                onClick={() => setView("profile")}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#E1DFDD"; e.currentTarget.style.transform = "scale(1.02)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#F3F2F1"; e.currentTarget.style.transform = "scale(1)"; }}
              >
                <div style={styles.quickActionIcon}>👤</div>
                <div style={styles.quickActionLabel}>Profile</div>
              </div>
            </div>
            
            <div style={styles.statsCard}>
              <div style={styles.statValue}>${stats.moneySaved}</div>
              <div style={styles.statLabel}>Total Money Saved</div>
            </div>
          </div>
        ) : view === "deals" ? (
          <div>
            <h2 style={{ fontSize: "20px", color: "#323130", marginBottom: "20px", fontWeight: "bold" }}>🎯 Today's Deals</h2>
            {surplusItems && surplusItems.length > 0 ? (
              surplusItems.map((item, idx) => {
                const sampleItem = sampleItems.find(si => si.name === (item.ProductName || item.product_name));
                const emoji = sampleItem ? sampleItem.image : "🍽️";
                return (
                  <div key={idx} style={styles.card}>
                    <div style={{ fontSize: "48px", marginBottom: "12px", textAlign: "center" }}>{emoji}</div>
                    <span style={styles.tag}>{item.Quantity || item.quantity_available || 0} portions left</span>
                    <div style={styles.title}>{item.ProductName || item.product_name}</div>
                    <div style={styles.priceRow}>
                      <span style={styles.newPrice}>${(item.DiscountPrice || item.discount_price || 0).toFixed(2)}</span>
                      <span style={styles.oldPrice}>Original ${(item.OriginalPrice || item.original_price || 0).toFixed(2)}</span>
                    </div>
                    <div style={styles.location}>📍 {item.Location || "Singapore Hawker Center"}</div>
                  </div>
                );
              })
            ) : (
              <div style={{ ...styles.alert, textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🥘</div>
                <div>No deals available right now</div>
                <div style={{ fontSize: "13px", color: "#605E5C", marginTop: "8px" }}>Check back later for fresh surplus food!</div>
              </div>
            )}
          </div>
        ) : view === "vendor" ? (
          <div>
            <h2 style={{ fontSize: "20px", color: "#323130", marginBottom: "20px", fontWeight: "bold" }}>📝 List Your Surplus</h2>
            
            {systemMessage && (
              <div style={{ 
                ...styles.alert, 
                ...(systemMessage.includes("SUCCESS") ? styles.alertSuccess : styles.alertError) 
              }}>
                {systemMessage}
              </div>
            )}
            
            <p style={{ fontSize: "14px", color: "#605E5C", marginBottom: "16px" }}>Quick Add - Tap to pre-fill:</p>
            <div style={styles.quickAddGrid}>
              {sampleItems.map((item, idx) => (
                <div 
                  key={idx} 
                  style={styles.quickAddItem}
                  onClick={() => handleQuickAdd(item.name)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#0078D4";
                    e.currentTarget.style.background = "#F3F2F1";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#E1DFDD";
                    e.currentTarget.style.background = "#FFF";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <div style={styles.quickAddIcon}>{item.image}</div>
                  <div style={styles.quickAddName}>{item.name}</div>
                  <div style={styles.quickAddPrice}>${item.defaultPrice.toFixed(2)}</div>
                </div>
              ))}
            </div>
            
            <form onSubmit={handleVendorSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "14px", fontWeight: "bold", color: "#323130", marginBottom: "8px", display: "block" }}>
                  Selected Item
                </label>
                <select 
                  style={styles.input} 
                  value={selectedItem} 
                  onChange={(e) => setSelectedItem(e.target.value)}
                  required
                >
                  <option value="">Select an item...</option>
                  {sampleItems.map((item, idx) => (
                    <option key={idx} value={item.name}>{item.image} {item.name}</option>
                  ))}
                </select>
              </div>
              
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "14px", fontWeight: "bold", color: "#323130", marginBottom: "8px", display: "block" }}>
                    Original Price ($)
                  </label>
                  <input 
                    type="number" 
                    step="0.01" 
                    style={styles.input} 
                    placeholder="8.00" 
                    value={originalPrice} 
                    onChange={(e) => setOriginalPrice(e.target.value)} 
                    required 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "14px", fontWeight: "bold", color: "#323130", marginBottom: "8px", display: "block" }}>
                    Discount Price ($)
                  </label>
                  <input 
                    type="number" 
                    step="0.01" 
                    style={styles.input} 
                    placeholder="4.00" 
                    value={discountPrice} 
                    onChange={(e) => setDiscountPrice(e.target.value)} 
                    required 
                  />
                </div>
              </div>
              
              <div>
                <label style={{ fontSize: "14px", fontWeight: "bold", color: "#323130", marginBottom: "8px", display: "block" }}>
                  Quantity Available
                </label>
                <input 
                  type="number" 
                  style={styles.input} 
                  placeholder="5" 
                  value={quantity} 
                  onChange={(e) => setQuantity(e.target.value)} 
                  required 
                />
              </div>
              
              <button 
                type="submit" 
                style={styles.submitBtn}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                🚀 List to SecondServe Shelf
              </button>
            </form>
          </div>
        ) : view === "dashboard" ? (
          <div>
            <h2 style={{ fontSize: "20px", color: "#323130", marginBottom: "20px", fontWeight: "bold" }}>📊 Dashboard</h2>
            
            <div style={styles.statsCard}>
              <div style={styles.statValue}>${stats.moneySaved}</div>
              <div style={styles.statLabel}>Total Money Saved</div>
            </div>
            
            <div style={styles.statsGrid}>
              <div style={styles.statBox}>
                <div style={styles.statBoxValue}>{stats.totalSaved}</div>
                <div style={styles.statBoxLabel}>Meals Saved</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.statBoxValue}>{stats.totalDeals}</div>
                <div style={styles.statBoxLabel}>Deals Claimed</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.statBoxValue}>{stats.totalOrders}</div>
                <div style={styles.statBoxLabel}>Orders Placed</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.statBoxValue}>{Math.floor(stats.moneySaved / stats.totalOrders) || 0}</div>
                <div style={styles.statBoxLabel}>Avg Savings</div>
              </div>
            </div>
            
            <div style={styles.card}>
              <div style={styles.title}>Recent Activity</div>
              <div style={{ fontSize: "14px", color: "#605E5C" }}>
                • Claimed Satay Ayam deal - 2 hours ago<br/>
                • Listed Nasi Lemak surplus - 5 hours ago<br/>
                • Saved $4.50 on Chicken Rice - Yesterday
              </div>
            </div>
          </div>
        ) : view === "profile" ? (
          <div>
            <div style={styles.profileCard}>
              <div style={styles.profileAvatar}>👤</div>
              <div style={styles.profileName}>{profile.name}</div>
              <div style={styles.profileEmail}>{profile.email}</div>
              <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "8px" }}>Member since {profile.joinedDate}</div>
            </div>
            
            <div style={styles.profileSection}>
              <div style={styles.profileSectionTitle}>Account Settings</div>
              <div style={styles.profileItem}>
                <span>Edit Profile</span>
                <span>→</span>
              </div>
              <div style={styles.profileItem}>
                <span>Change Password</span>
                <span>→</span>
              </div>
              <div style={styles.profileItem}>
                <span>Notification Settings</span>
                <span>→</span>
              </div>
            </div>
            
            <div style={styles.profileSection}>
              <div style={styles.profileSectionTitle}>Preferences</div>
              <div style={styles.profileItem}>
                <span>Language</span>
                <span>English →</span>
              </div>
              <div style={styles.profileItem}>
                <span>Currency</span>
                <span>SGD →</span>
              </div>
            </div>
            
            <div style={styles.profileSection}>
              <div style={styles.profileSectionTitle}>Support</div>
              <div style={styles.profileItem}>
                <span>Help Center</span>
                <span>→</span>
              </div>
              <div style={styles.profileItem}>
                <span>Contact Us</span>
                <span>→</span>
              </div>
            </div>
            
            <button 
              style={{ ...styles.submitBtn, background: "#A80000" }}
              onClick={() => { setView("login"); setUserType(""); }}
            >
              Log Out
            </button>
          </div>
        ) : null}
      </div>
      
      {view !== "login" && (
        <div style={styles.bottomNav}>
          <div 
            style={{ ...styles.navItem, ...(view === "home" ? styles.navItemActive : {}) }}
            onClick={() => setView("home")}
          >
            <div style={styles.navIcon}>🏠</div>
            <div>Home</div>
          </div>
          <div 
            style={{ ...styles.navItem, ...(view === "deals" ? styles.navItemActive : {}) }}
            onClick={() => setView("deals")}
          >
            <div style={styles.navIcon}>🎯</div>
            <div>Deals</div>
          </div>
          <div 
            style={{ ...styles.navItem, ...(view === "vendor" ? styles.navItemActive : {}) }}
            onClick={() => setView("vendor")}
          >
            <div style={styles.navIcon}>📝</div>
            <div>List</div>
          </div>
          <div 
            style={{ ...styles.navItem, ...(view === "dashboard" ? styles.navItemActive : {}) }}
            onClick={() => setView("dashboard")}
          >
            <div style={styles.navIcon}>📊</div>
            <div>Stats</div>
          </div>
          <div 
            style={{ ...styles.navItem, ...(view === "profile" ? styles.navItemActive : {}) }}
            onClick={() => setView("profile")}
          >
            <div style={styles.navIcon}>👤</div>
            <div>Profile</div>
          </div>
        </div>
      )}
    </div>
  );
}
