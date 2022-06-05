export function enableItem(item: string){
  return { type: 'ENABLE_ITEM', payload: item };
}

export function disableItem(item: string){
  return { type: 'DISABLE_ITEM', payload: item };
}
