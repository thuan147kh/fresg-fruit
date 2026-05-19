const fs = require('fs');

const allFiles = [
  'src/routes/b2b.customers.new.tsx',
  'src/routes/b2b.customers.tsx',
  'src/routes/b2b.orders.new.tsx',
  'src/routes/b2b.orders.tsx',
  'src/routes/banners.new.tsx',
  'src/routes/categories.new.tsx',
  'src/routes/categories.tsx',
  'src/routes/customers.new.tsx',
  'src/routes/inventory.batches.new.tsx',
  'src/routes/membership.tsx',
  'src/routes/orders.new.tsx',
  'src/routes/orders.tsx',
  'src/routes/posts.new.tsx',
  'src/routes/products.new.tsx',
  'src/routes/products.tsx',
  'src/routes/stores.new.tsx',
  'src/routes/vouchers.new.tsx'
];

allFiles.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let isNew = f.includes('.new.') || f.includes('.edit.');
  
  let moduleName = f.replace('src/routes/', '').replace('.tsx', '').replace('.new', '').replace(/\./g, '/');
  
  if (isNew) {
    let backUrl = '/' + moduleName;
    let replacement = `<Link to="${backUrl}" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"><ArrowLeft className="size-4" /> Quay lại</Link>`;
    content = content.replace(/<Link to=><Button><\/Button><\/Link>/g, replacement);
  } else {
    let createUrl = '/' + moduleName + '/new';
    let replacement = `<Link to="${createUrl}" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"><Plus className="size-4" /> Tạo mới</Link>`;
    content = content.replace(/<Link to=><Button><\/Button><\/Link>/g, replacement);
  }
  
  fs.writeFileSync(f, content, 'utf8');
});
console.log('Restored correctly!');
