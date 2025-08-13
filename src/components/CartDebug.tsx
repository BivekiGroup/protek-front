import React from 'react';
import { useCart } from '@/contexts/CartContext';

const CartDebug: React.FC = () => {
  const { state, isInCart } = useCart();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Test the isInCart function with some example values from the cart
  const testItem = state.items[0];
  const testResult = testItem ? isInCart(testItem.productId, testItem.offerKey, testItem.article, testItem.brand) : false;

  return (
    <div 
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.9)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '11px',
        maxWidth: '350px',
        zIndex: 9999,
        maxHeight: '400px',
        overflow: 'auto'
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>🛒 Cart Debug: {state.items.length} items</div>
      {testItem && (
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '5px', marginBottom: '5px', fontSize: '10px' }}>
          <div>Testing isInCart for first item:</div>
          <div>Brand: {testItem.brand}, Article: {testItem.article}</div>
          <div>Result: {testResult ? '✅ Found' : '❌ Not found'}</div>
        </div>
      )}
      {state.items.slice(0, 6).map((item, idx) => (
        <div key={idx} style={{ fontSize: '9px', marginTop: '3px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '2px' }}>
          {item.brand} {item.article}
          {item.productId && <div style={{ color: '#90EE90' }}>PID: {item.productId.substring(0, 8)}...</div>}
          {item.offerKey && <div style={{ color: '#87CEEB' }}>OK: {item.offerKey.substring(0, 15)}...</div>}
        </div>
      ))}
      {state.items.length > 6 && (
        <div style={{ fontSize: '9px', marginTop: '3px', opacity: 0.7 }}>
          ...и еще {state.items.length - 6} товаров
        </div>
      )}
    </div>
  );
};

export default CartDebug; 