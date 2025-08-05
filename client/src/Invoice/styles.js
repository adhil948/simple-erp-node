// styles.js

export const styles = {
  container: {
    maxWidth: 950, margin: '40px auto', background: '#f7f9fa', borderRadius: 12, boxShadow: '0 8px 32px #0002', padding: 32
  },
  table: {
    width: '100%', marginBottom: 22, borderSpacing: 0, background: '#fff', borderRadius: 8, overflow: 'hidden'
  },
  th: {
    textAlign:"left",background: '#e6f0fa', padding: 8, fontWeight: 600, fontSize: 16, borderBottom: '2px solid #dde'
  },
  td: {
    textAlign:"left", padding: 8, fontSize: 15, borderBottom: '1px solid #eee'
  },
  actionBtn: {
    marginRight: 10, padding: "6px 18px", borderRadius: 6, border: 'none', cursor: 'pointer', background: "#2d72d9", color: "white"
  },
  dangerBtn: {
    background: "#ea4e3d",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "6px 18px",
    cursor: "pointer",
    marginLeft: 10,
  },
  printBtn: {
    background: "#39b54a",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "6px 18px",
    cursor: "pointer",
    marginLeft: 10,
  },
  highlight: {
    color: "#2563eb",
    fontWeight: "bold"
  },
  invoiceCard: {
    background: "#fff",
    borderRadius: 10,
    padding: 32,
    boxShadow: '0 6px 32px #0002'
  }
};

export const printCSS = `
@media print {
  body * { visibility: hidden !important; }
  #printable-invoice, #printable-invoice * { visibility: visible !important; }
  #printable-invoice { 
    position: absolute !important; 
    left: 0; top: 0; width: 100vw; background: #fff; box-shadow: none; 
    padding: 0 !important;
    margin: 0 !important; 
    max-width:none !important;
  } 
  .no-print { display: none !important;}
}
`;
