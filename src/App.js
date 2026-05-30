import React, { useState, useEffect } from "react";

export default function App() {
  const [activeTab, setActiveTab] = useState("customer");
  const [surplusItems, setSurplusItems] = useState([]);
  const [systemMessage, setSystemMessage] = useState("");
  
  // Vendor Intake Form State
  const [vendorId, setVendorId] = useState("1");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("Meals");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  // FIXED: Re-aligned API base routing domain context to target the new live Azure Container App environment substrate
  const API_BASE_URL = "https://aca-secondserve-backend.livelybay-f6fd5e2b.southeastasia.azurecontainerapps.io/api/v1/products";

  useEffect(() => {
    if (activeTab === "customer") {
      fetchSurplusData();
    }
  }, [activeTab]);

  const fetchSurplusData = async () => {
    try {
      const response = await fetch(API_BASE_URL);
      const result = await response.json();
      if (result.status === "success") {
        setSurplusItems(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch cloud database.", error);
    }
  };

  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    setSystemMessage("Transmitting to Azure SQL...");
    
    const payload = {
      vendor_id: parseInt(vendorId),
      product_name: productName,
      category: category,
      original_price: parseFloat(originalPrice),
      discount_price: parseFloat(discountPrice),
      quantity_available: parseInt(quantity),
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
        setProductName("");
        setOriginalPrice("");
        setDiscountPrice("");
        setQuantity("");
        if (activeTab === "customer") {
          fetchSurplusData();
        }
      } else {
        setSystemMessage("ERROR: Transaction rejected by backend.");
      }
    } catch (error) {
      setSystemMessage("CRITICAL: Network execution failure.");
    }
  };

  const styles = {
    container: { maxWidth: "480px", margin: "0 auto", background: "#FFF", minHeight: "100vh", display: "flex", flexDirection: "column" },
    header: { background: "#0078D4", color: "#FFF", padding: "16px", textAlign: "center", fontWeight: "bold", fontSize: "18px" },
    nav: { display: "flex", borderBottom: "1px solid #E1DFDD" },
    btn: (active) => ({ flex: 1, padding: "12px", border: "none", background: active ? "#FFF" : "#F3F2F1", color: active ? "#0078D4" : "#605E5C", fontWeight: "bold", borderBottom: active ? "3px solid #0078D4" : "none", cursor: "pointer" }),
    content: { padding: "16px", flex: 1, overflowY: "auto" },
    card: { border: "1px solid #E1DFDD", padding: "12px", borderRadius: "8px", marginBottom: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" },
    tag: { background: "#DFF6DD", color: "#107C41", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold", display: "inline-block", marginBottom: "8px" },
    title: { fontSize: "16px", fontWeight: "bold", marginBottom: "4px" },
    priceRow: { display: "flex", gap: "8px", alignItems: "baseline", marginBottom: "4px" },
    newPrice: { color: "#D83B01", fontSize: "18px", fontWeight: "bold" },
    oldPrice: { textDecoration: "line-through", color: "#A19F9D", fontSize: "12px" },
    location: { color: "#605E5C", fontSize: "12px" },
    input: { width: "100%", padding: "12px", marginBottom: "12px", border: "1px solid #8A8886", borderRadius: "4px", fontSize: "14px" },
    submitBtn: { width: "100%", padding: "14px", background: "#107C41", color: "#FFF", border: "none", borderRadius: "4px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" },
    alert: { padding: "10px", background: "#F3F2F1", textAlign: "center", marginBottom: "12px", fontSize: "12px", fontWeight: "bold" }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>SecondServe</div>
      <div style={styles.nav}>
        <button style={styles.btn(activeTab === "customer")} onClick={() => setActiveTab("customer")}>NEAR ME DEALS</button>
        <button style={styles.btn(activeTab === "vendor")} onClick={() => setActiveTab("vendor")}>VENDOR INTAKE</button>
      </div>
      
      <div style={styles.content}>
        {activeTab === "customer" ? (
          <div>
            <h2 style={{ fontSize: "14px", color: "#605E5C", marginBottom: "12px", textTransform: "uppercase" }}>Hyperlocal Deals Shelf</h2>
            {surplusItems && surplusItems.length > 0 ? (
              surplusItems.map((item, idx) => (
                <div key={idx} style={styles.card}>
                  <span style={styles.tag}>{item.Quantity || item.quantity_available || 0} Portions Left</span>
                  <div style={styles.title}>{item.ProductName || item.product_name}</div>
                  <div style={styles.priceRow}>
                    <span style={styles.newPrice}>${(item.DiscountPrice || item.discount_price || 0).toFixed(2)}</span>
                    <span style={styles.oldPrice}>Original Price</span>
                  </div>
                  <div style={styles.location}>📍 {item.Location || "Default Node Station"}</div>
                </div>
              ))
            ) : (
              <div style={styles.alert}>No active surplus listed on this cloud subscription workspace node.</div>
            )}
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: "14px", color: "#605E5C", marginBottom: "12px", textTransform: "uppercase" }}>One-Tap Surplus Listing</h2>
            {systemMessage && <div style={styles.alert}>{systemMessage}</div>}
            <form onSubmit={handleVendorSubmit}>
              <input type="text" style={styles.input} placeholder="Food Item Name" value={productName} onChange={(e) => setProductName(e.target.value)} required />
              <div style={{ display: "flex", gap: "8px" }}>
                <input type="number" step="0.01" style={styles.input} placeholder="Orig. Price ($)" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} required />
                <input type="number" step="0.01" style={styles.input} placeholder="Discount ($)" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} required />
              </div>
              <input type="number" style={styles.input} placeholder="Quantity Available" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
              <button type="submit" style={styles.submitBtn}>LIST TO SECONDSERVE SHELF</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
