const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const core=require('../js/core.js');
function setup(){const catalog=[{id:'1',name:'Silla',description:'Una silla',category:'Estudio',price:10000,stock:2,images:['assets/products/14/1.webp']}];let persisted;const context={window:{},FormaCore:core,FORMA_CATALOG:catalog,structuredClone,localStorage:{getItem:()=>null,setItem:(key,value)=>{persisted=value;}}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/store.js'),'utf8'),context);return {store:context.window.FormaStore,persisted:()=>persisted};}
test('checkout updates stock, creates snapshot, and clears cart together',()=>{const {store}=setup();store.setQuantity('1',2);store.checkout('FORMA10','demo');const s=store.get();assert.equal(s.products[0].stock,0);assert.equal(Object.keys(s.cart).length,0);assert.equal(s.orders[0].items[0].quantity,2);assert.equal(s.orders[0].discount,2000);});
test('rejected quantity leaves state unchanged',()=>{const {store}=setup();store.setQuantity('1',1);assert.throws(()=>store.setQuantity('1',3));assert.equal(store.get().cart['1'],1);});
test('inventory edits reconcile cart and do not rewrite past order items',()=>{const {store}=setup();store.setQuantity('1',1);store.checkout('','demo');const product=store.get().products[0];store.saveProduct({...product,name:'Nombre nuevo',price:20000});assert.equal(store.get().orders[0].items[0].name,'Silla');assert.equal(store.get().orders[0].items[0].price,10000);store.setQuantity('1',1);store.saveProduct({...product,stock:0});assert.equal(Object.keys(store.get().cart).length,0);});
