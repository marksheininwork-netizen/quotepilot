export const money = value => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(value)||0);
export function parseItems(text){return text.split('\n').map(line=>line.trim()).filter(Boolean).map(line=>{const [description='',quantity='1',price='0']=line.split('|').map(v=>v.trim());return{description,quantity:Number(quantity),price:Number(price)}})}
export function quoteTotal(items){return items.reduce((sum,item)=>sum+(Number(item.quantity)||0)*(Number(item.price)||0),0)}
export function itemLines(items){return items.map(i=>`${i.description} | ${i.quantity} | ${i.price}`).join('\n')}
