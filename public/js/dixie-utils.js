
//
// Define Dexie database
//
var db = new Dexie("DexieItemsDB");
db
  .version(1)
  .stores({
    itemsDB: '++id,imageurl,text,title'
  });

//
// Add Item to Dexie Database
//
async function addItem(data) {
  return await db.itemsDB.add(data);
}

function getAllItems() {
  console.log('getAllItems runs...')
  return db.itemsDB.toArray();
}

//
// Delete all Items in Dexie Database
//
async function deleteAllItems() {
  await db.itemsDB.clear();
}