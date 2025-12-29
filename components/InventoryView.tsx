
import React, { useState, useMemo, useEffect } from 'react';
import { Product, ChannelType, CategoryMap, ChannelConfig } from '../types';
import { Search, Plus, Image as ImageIcon, Edit2, Trash2, CalendarPlus, X, Tag, Folder, ChevronRight, ChevronDown, LayoutGrid, Package, Clock, Pencil, Upload } from 'lucide-react';

interface InventoryViewProps {
  products: Product[];
  categories: CategoryMap;
  channels: Record<string, ChannelConfig>;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onCopyToSchedule: (product: Product) => void;
  onAddSubCategory: (channel: ChannelType, sub: string) => void;
  onRenameSubCategory: (channel: ChannelType, oldName: string, newName: string) => void;
  onAddMainCategory: (name: string) => void;
  onRenameMainCategory: (oldName: string, newName: string) => void;
  onDeleteMainCategory: (name: string) => void;
}

const InventoryView: React.FC<InventoryViewProps> = ({ 
  products, 
  categories,
  channels,
  onAddProduct, 
  onUpdateProduct, 
  onDeleteProduct,
  onCopyToSchedule,
  onAddSubCategory,
  onRenameSubCategory,
  onAddMainCategory,
  onRenameMainCategory,
  onDeleteMainCategory
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(Object.keys(channels)));
  const [selectedNode, setSelectedNode] = useState<{ type: 'root' | 'sub' | 'all', id: string, parent?: string }>({ type: 'all', id: 'all' });

  // Modals visibility
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // Category Action State (Add/Rename Main or Sub)
  const [categoryAction, setCategoryAction] = useState<{
      scope: 'main' | 'sub';
      type: 'add' | 'rename';
      channel?: ChannelType;
      targetName?: string;
  } | null>(null);
  const [categoryActionValue, setCategoryActionValue] = useState('');

  // Form State for Product
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState<ChannelType>(Object.keys(channels)[0] || '');
  const [subCategory, setSubCategory] = useState('');
  const [tags, setTags] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Sync subCategory options when category changes in form
  useEffect(() => {
    const subs = categories[category] || [];
    if (subs.length > 0 && !subs.includes(subCategory)) {
        setSubCategory(subs[0]);
    } else if (subs.length === 0) {
        setSubCategory('');
    }
  }, [category, categories]);

  // Handle Edit Product
  useEffect(() => {
    if (editingProduct) {
        setName(editingProduct.name);
        setDesc(editingProduct.description);
        setCategory(editingProduct.channel);
        setSubCategory(editingProduct.subCategory || '');
        setTags(editingProduct.tags.join(', '));
        setImagePreview(editingProduct.image || null);
    } else {
        setName('');
        setDesc('');
        setCategory(Object.keys(channels)[0] || '');
        setSubCategory('');
        setTags('');
        setImagePreview(null);
    }
  }, [editingProduct, channels]);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) newExpanded.delete(nodeId);
    else newExpanded.add(nodeId);
    setExpandedNodes(newExpanded);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = !term || (p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term));
      if (!matchesSearch) return false;
      if (selectedNode.type === 'all') return true;
      if (selectedNode.type === 'root') return p.channel === selectedNode.id;
      if (selectedNode.type === 'sub') return p.channel === selectedNode.parent && p.subCategory === selectedNode.id;
      return true;
    });
  }, [products, searchTerm, selectedNode]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData: Product = {
      id: editingProduct?.id || crypto.randomUUID(),
      name,
      description: desc,
      channel: category,
      subCategory: subCategory || undefined,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      image: imagePreview || undefined,
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
      lastScheduledAt: editingProduct?.lastScheduledAt
    };

    if (editingProduct) onUpdateProduct(productData);
    else onAddProduct(productData);

    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmitCategoryAction = (e: React.FormEvent) => {
      e.preventDefault();
      const val = categoryActionValue.trim();
      if (!val || !categoryAction) return;

      if (categoryAction.scope === 'main') {
          if (categoryAction.type === 'add') onAddMainCategory(val);
          else if (categoryAction.targetName) onRenameMainCategory(categoryAction.targetName, val);
      } else {
          if (categoryAction.type === 'add' && categoryAction.channel) onAddSubCategory(categoryAction.channel, val);
          else if (categoryAction.type === 'rename' && categoryAction.channel && categoryAction.targetName) 
            onRenameSubCategory(categoryAction.channel, categoryAction.targetName, val);
      }
      setCategoryAction(null);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* HEADER */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between shrink-0">
        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
           <Package className="text-blue-600" /> Kho sản phẩm
        </h2>
        <div className="flex gap-2 w-full max-w-md ml-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input type="text" placeholder="Tìm sản phẩm..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-800 outline-none" />
            </div>
            <button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                <Plus size={16} /> Nhập mới
            </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: CATEGORIES */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0 overflow-y-auto">
            <div className="p-4 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Danh mục</span>
                <button 
                    onClick={() => { setCategoryAction({ scope: 'main', type: 'add' }); setCategoryActionValue(''); }}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-blue-600"
                >
                    <Plus size={16} />
                </button>
            </div>

            <div className="px-2 space-y-1">
                <div onClick={() => setSelectedNode({ type: 'all', id: 'all' })} className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm font-medium ${selectedNode.type === 'all' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700' : 'text-gray-700 dark:text-gray-300'}`}><LayoutGrid size={16} /><span>Tất cả</span></div>

                {Object.keys(channels).map((chName) => {
                    const ch = channels[chName];
                    const isExpanded = expandedNodes.has(chName);
                    const isSelected = selectedNode.type === 'root' && selectedNode.id === chName;
                    const subCats = categories[chName] || [];

                    return (
                        <div key={chName}>
                            <div className={`group flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors ${isSelected ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                                <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => setSelectedNode({ type: 'root', id: chName })}>
                                    <button onClick={(e) => { e.stopPropagation(); toggleNode(chName); }} className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    </button>
                                    <Folder size={14} className={ch.color.split(' ')[0]} />
                                    <span className="text-sm font-medium truncate">{chName}</span>
                                </div>
                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => { e.stopPropagation(); setCategoryAction({ scope: 'main', type: 'rename', targetName: chName }); setCategoryActionValue(chName); }} className="p-1 text-gray-400 hover:text-blue-500"><Pencil size={12} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); setCategoryAction({ scope: 'sub', type: 'add', channel: chName }); setCategoryActionValue(''); }} className="p-1 text-gray-400 hover:text-green-500"><Plus size={14} /></button>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="ml-6 border-l border-gray-100 dark:border-gray-700 mt-1 space-y-0.5">
                                    {subCats.map(sub => (
                                        <div key={sub} className={`group flex items-center justify-between pl-4 pr-2 py-1 cursor-pointer rounded-r-lg text-xs ${selectedNode.type === 'sub' && selectedNode.id === sub && selectedNode.parent === chName ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-bold' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                            <span className="truncate flex-1" onClick={() => setSelectedNode({ type: 'sub', id: sub, parent: chName })}>{sub}</span>
                                            <button onClick={(e) => { e.stopPropagation(); setCategoryAction({ scope: 'sub', type: 'rename', channel: chName, targetName: sub }); setCategoryActionValue(sub); }} className="opacity-0 group-hover:opacity-100 p-0.5"><Pencil size={10} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

        {/* RIGHT CONTENT: PRODUCT GRID */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar">
            {filteredProducts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Package size={64} strokeWidth={1} className="mb-4 opacity-20" />
                    <p>Không tìm thấy sản phẩm nào</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredProducts.map(prod => (
                        <div key={prod.id} onClick={() => {setViewingProduct(prod); setIsDetailModalOpen(true);}} className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-3 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
                            <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl mb-3 flex items-center justify-center overflow-hidden relative">
                                {prod.image ? <img src={prod.image} className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-400" size={32} />}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-800 dark:text-white truncate mb-1">{prod.name}</h3>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate max-w-[80%]">
                                    {prod.subCategory || prod.channel}
                                </span>
                                <div className={`w-2 h-2 rounded-full ${channels[prod.channel]?.bg.replace('100', '500')}`}></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* PRODUCT FORM MODAL */}
      {isProductModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                      <h3 className="text-lg font-black text-gray-800 dark:text-white">{editingProduct ? 'Sửa sản phẩm' : 'Nhập sản phẩm mới'}</h3>
                      <button onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><X size={20} /></button>
                  </div>
                  <form onSubmit={handleProductSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                      {/* Image Upload */}
                      <div className="flex justify-center">
                          <label className="relative group cursor-pointer">
                              <div className="w-32 h-32 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-700 hover:border-blue-500 transition-all">
                                  {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center text-gray-400"><Upload size={24} /><span className="text-[10px] mt-1 font-bold">Thêm ảnh</span></div>}
                              </div>
                              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                          </label>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tên sản phẩm</label>
                              <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 outline-none font-bold" />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nhóm chính</label>
                                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm font-bold">
                                      {Object.keys(channels).map(ch => <option key={ch} value={ch}>{ch}</option>)}
                                  </select>
                              </div>
                              <div className="space-y-1">
                                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nhóm con</label>
                                  <select value={subCategory} onChange={e => setSubCategory(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm font-bold">
                                      <option value="">(Trống)</option>
                                      {(categories[category] || []).map(sub => <option key={sub} value={sub}>{sub}</option>)}
                                  </select>
                              </div>
                          </div>

                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tags (phân cách bởi dấu phẩy)</label>
                              <div className="relative">
                                  <Tag className="absolute left-3 top-3 text-gray-400" size={16} />
                                  <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="review, giadung, hot..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm font-bold" />
                              </div>
                          </div>

                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mô tả ngắn</label>
                              <textarea value={desc} onChange={e => setDesc(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm min-h-[80px]" />
                          </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                          <button type="button" onClick={() => setIsProductModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all">Hủy</button>
                          <button type="submit" className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">Lưu sản phẩm</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* PRODUCT DETAIL MODAL */}
      {isDetailModalOpen && viewingProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
              <div className="bg-white dark:bg-gray-800 rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
                  <div className="w-full md:w-1/2 aspect-square md:aspect-auto bg-gray-100 dark:bg-gray-700 relative">
                      {viewingProduct.image ? <img src={viewingProduct.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={64} /></div>}
                      <button onClick={() => setIsDetailModalOpen(false)} className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full"><X size={20} /></button>
                  </div>
                  <div className="flex-1 p-8 flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${channels[viewingProduct.channel]?.bg} ${channels[viewingProduct.channel]?.color}`}>
                              {viewingProduct.channel}
                          </span>
                          {viewingProduct.subCategory && <span className="text-xs font-bold text-gray-400">/ {viewingProduct.subCategory}</span>}
                      </div>
                      <h2 className="text-3xl font-black text-gray-800 dark:text-white mb-4">{viewingProduct.name}</h2>
                      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 flex-1">{viewingProduct.description || "Chưa có mô tả cho sản phẩm này."}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-8">
                          {viewingProduct.tags.map(t => <span key={t} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-bold">#{t}</span>)}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => { setIsDetailModalOpen(false); setEditingProduct(viewingProduct); setIsProductModalOpen(true); }}
                            className="flex items-center justify-center gap-2 py-3 border border-gray-200 dark:border-gray-600 rounded-2xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                          >
                              <Edit2 size={16} /> Sửa
                          </button>
                          <button 
                            onClick={() => { onDeleteProduct(viewingProduct.id); setIsDetailModalOpen(false); }}
                            className="flex items-center justify-center gap-2 py-3 border border-red-100 text-red-500 hover:bg-red-50 rounded-2xl font-bold transition-all"
                          >
                              <Trash2 size={16} /> Xóa
                          </button>
                          <button 
                            onClick={() => { onCopyToSchedule(viewingProduct); setIsDetailModalOpen(false); }}
                            className="col-span-2 flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 transition-all"
                          >
                              <CalendarPlus size={20} /> Lên lịch quay ngay
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* CATEGORY ACTION MODAL (ADD/RENAME MAIN & SUB) */}
      {categoryAction && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                      <Folder className="text-blue-600" size={18} />
                      {categoryAction.type === 'add' ? 'Thêm mới' : 'Đổi tên'} {categoryAction.scope === 'main' ? 'Nhóm chính' : `Nhóm con của "${categoryAction.channel}"`}
                  </h3>
                  <form onSubmit={handleSubmitCategoryAction}>
                      <input 
                        autoFocus 
                        type="text" 
                        value={categoryActionValue} 
                        onChange={(e) => setCategoryActionValue(e.target.value)} 
                        placeholder="Nhập tên danh mục..." 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none font-bold mb-4 focus:border-blue-500" 
                      />
                      <div className="flex gap-3">
                          <button type="button" onClick={() => setCategoryAction(null)} className="flex-1 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Hủy</button>
                          <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md">Xác nhận</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default InventoryView;
