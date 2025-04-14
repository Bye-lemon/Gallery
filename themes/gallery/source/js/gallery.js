/**
 * AI图像画廊
 * 现代瀑布流布局和先进的用户交互
 */

// 定义全局变量
let masonry;
let currentTheme = 'auto';
let activeFilter = 'all';
let currentPage = 1;
const imagesPerPage = 12;

// 当DOM加载完成时初始化
document.addEventListener('DOMContentLoaded', function() {
  // 初始化主题
  initTheme();
  
  // 初始化Hero区域视差滚动
  initParallax();
  
  // 初始化瀑布流布局
  initMasonry();
  
  // 初始化模态框事件
  initModalEvents();
  
  // 初始化过滤器和排序
  initFilters();
  
  // 初始化图片加载动画
  initImageLoadAnimations();
  
  // 初始化分页
  initPagination();
});

// 初始化主题切换功能
function initTheme() {
  const themeToggle = document.querySelector('.theme-toggle');
  if (!themeToggle) return;
  
  // 检查用户首选项或本地存储
  const savedTheme = localStorage.getItem('gallery-theme');
  if (savedTheme) {
    currentTheme = savedTheme;
    document.documentElement.className = savedTheme === 'dark' ? 'dark-theme' : 
                                         savedTheme === 'light' ? 'light-theme' : 'auto-theme';
  } else {
    document.documentElement.className = 'auto-theme';
  }
  
  // 更新图标
  updateThemeIcon();
  
  // 添加切换事件
  themeToggle.addEventListener('click', function() {
    // 循环切换主题: auto -> light -> dark -> auto
    currentTheme = currentTheme === 'auto' ? 'light' : 
                   currentTheme === 'light' ? 'dark' : 'auto';
    
    // 应用新主题
    document.documentElement.className = currentTheme === 'dark' ? 'dark-theme' : 
                                         currentTheme === 'light' ? 'light-theme' : 'auto-theme';
    
    // 保存到本地存储
    localStorage.setItem('gallery-theme', currentTheme);
    
    // 更新图标
    updateThemeIcon();
  });
}

// 更新主题切换按钮图标
function updateThemeIcon() {
  const themeIcon = document.querySelector('.theme-toggle__icon');
  if (!themeIcon) return;
  
  // 移除所有可能的类
  themeIcon.classList.remove('fa-sun', 'fa-moon', 'fa-circle-half-stroke');
  
  // 添加当前主题对应的图标
  if (currentTheme === 'light') {
    themeIcon.classList.add('fa-sun');
  } else if (currentTheme === 'dark') {
    themeIcon.classList.add('fa-moon');
  } else {
    themeIcon.classList.add('fa-circle-half-stroke');
  }
}

// 初始化Hero区域视差滚动
function initParallax() {
  const hero = document.querySelector('.gallery-hero');
  if (!hero) return;
  
  window.addEventListener('scroll', function() {
    const scrollPosition = window.scrollY;
    if (scrollPosition < window.innerHeight) {
      hero.style.transform = `translateY(${scrollPosition * 0.3}px)`;
      hero.querySelector('.gallery-hero__title').style.transform = `translateY(${scrollPosition * 0.2}px)`;
      hero.querySelector('.gallery-hero__subtitle').style.transform = `translateY(${scrollPosition * 0.1}px)`;
    }
  });
}

// 初始化瀑布流布局
function initMasonry() {
  const grid = document.getElementById('gallery-masonry');
  if (!grid) return;
  
  try {
    // 计算合适的列宽
    const containerWidth = grid.clientWidth || grid.parentNode.clientWidth || window.innerWidth;
    const columnWidth = calculateOptimalColumnWidth(containerWidth);
    
    // 使用Masonry的原生实现，不依赖grid布局
    imagesLoaded(grid, function() {
      try {
        // 安全检查
        if (!grid.children.length) {
          console.warn('无法初始化Masonry：网格中没有子元素');
          return;
        }
        
        masonry = new Masonry(grid, {
          itemSelector: '.gallery-item',
          columnWidth: columnWidth,
          percentPosition: false,
          gutter: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--gap-lg')) || 15,
          fitWidth: true,
          transitionDuration: '0.4s',
          stagger: 30,
          // 只设置宽度，让高度自适应保持原始宽高比
          resize: true,
          initLayout: true
        });
        
        // 显示图片
        setTimeout(() => {
          document.querySelectorAll('.gallery-item').forEach((item, index) => {
            setTimeout(() => {
              item.classList.add('fade-in');
            }, index * 50);
          });
        }, 200);
      } catch (err) {
        console.error('Masonry实例化错误：', err);
      }
    });
    
    // 监听窗口调整大小事件
    window.addEventListener('resize', debounce(function() {
      if (!grid) return;
      
      try {
        const newContainerWidth = grid.clientWidth || grid.parentNode.clientWidth || window.innerWidth;
        const newColumnWidth = calculateOptimalColumnWidth(newContainerWidth);
        
        if (masonry && masonry.options) {
          // 重新布局
          masonry.options.columnWidth = newColumnWidth;
          masonry.layout();
        }
      } catch (err) {
        console.error('窗口大小调整错误：', err);
      }
    }, 200));
  } catch (err) {
    console.error('瀑布流初始化错误：', err);
  }
}

// 计算最佳列宽
function calculateOptimalColumnWidth(containerWidth) {
  // 安全检查：确保容器宽度是有效值
  if (!containerWidth || containerWidth <= 0 || isNaN(containerWidth)) {
    console.warn('容器宽度无效，使用默认值');
    containerWidth = window.innerWidth || document.documentElement.clientWidth || 300;
  }
  
  // 根据容器宽度决定合适的列数
  let columns;
  
  if (containerWidth < 576) {
    columns = 2; // 移动设备显示2列
  } else if (containerWidth < 768) {
    columns = 3; // 小屏幕设备显示3列
  } else if (containerWidth < 992) {
    columns = 4; // 中等屏幕设备显示4列
  } else {
    columns = 5; // 大屏幕设备显示5列
  }
  
  // 计算列宽，减去间隔宽度
  const gutter = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--gap-lg')) || 15;
  
  // 防止可能导致负数的情况
  const totalGutterWidth = gutter * (columns - 1);
  if (totalGutterWidth >= containerWidth) {
    // 如果间隙总宽度超过或等于容器宽度，调整列数
    columns = Math.max(1, Math.floor(containerWidth / (gutter + 50)));
  }
  
  // 安全计算列宽
  let columnWidth;
  try {
    columnWidth = Math.floor((containerWidth - (gutter * (columns - 1))) / columns);
  } catch (error) {
    console.error('计算列宽时出错：', error);
    columnWidth = Math.floor(containerWidth / columns);
  }
  
  // 确保列宽为正数且合理
  if (columnWidth <= 50 || isNaN(columnWidth)) {
    columnWidth = Math.floor(containerWidth / Math.max(1, columns));
    if (columnWidth <= 50 || isNaN(columnWidth)) {
      columnWidth = 100; // 绝对最小列宽
    }
  }
  
  // 设置所有图片项的宽度
  try {
    const items = document.querySelectorAll('.gallery-item');
    if (items && items.length > 0) {
      items.forEach(item => {
        if (item) item.style.width = `${columnWidth}px`;
      });
    }
  } catch (error) {
    console.error('设置项目宽度时出错：', error);
  }
  
  return columnWidth;
}

// 防抖函数
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

// 初始化模态框事件
function initModalEvents() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  const modal = document.getElementById('imageModal');
  
  if (!modal || galleryItems.length === 0) return;
  
  // 获取模态框元素
  const modalImg = modal.querySelector('.modal-img');
  const modalPrompt = modal.querySelector('.modal-prompt');
  const modalCreator = modal.querySelector('.modal-creator');
  const modalClose = modal.querySelector('.modal-close');
  const downloadBtn = modal.querySelector('.download-btn');
  const copyPromptBtn = modal.querySelector('.copy-prompt-btn');
  
  // 点击图片项显示模态框
  galleryItems.forEach(item => {
    item.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      // 确保索引在有效范围内
      if (index >= 0 && index < window.galleryData.length) {
        const imageData = window.galleryData[index];
        
        if (imageData) {
          // 填充模态框内容
          modalImg.src = imageData.img_link;
          modalImg.alt = imageData.prompt;
          modalPrompt.textContent = imageData.prompt;
          modalCreator.textContent = imageData.creator;
          
          // 设置下载链接
          if (downloadBtn) {
            downloadBtn.href = imageData.img_link;
            // 从URL中提取文件名，或使用默认名称
            let fileName = 'ai-image.png';
            try {
              const url = new URL(imageData.img_link);
              const pathSegments = url.pathname.split('/');
              if (pathSegments.length > 0) {
                const lastSegment = pathSegments[pathSegments.length - 1];
                if (lastSegment && lastSegment.includes('.')) {
                  fileName = lastSegment;
                }
              }
            } catch (e) {
              console.warn('无法从URL解析文件名:', e);
            }
            downloadBtn.setAttribute('download', fileName);
          }
          
          // 显示模态框
          modal.classList.add('active');
          document.body.style.overflow = 'hidden'; // 防止背景滚动
          
          // 添加平台图标
          const platformIcon = modal.querySelector('.detail-section__platform-icon');
          if (platformIcon) {
            platformIcon.className = 'detail-section__platform-icon fa-solid';
            
            // 获取creator的第一段（如果有空格就取空格前的部分）
            const creatorFirstPart = imageData.creator.split(' ')[0].toLowerCase();
            
            // 根据平台添加不同图标
            if (creatorFirstPart === 'midjourney') {
              platformIcon.classList.add('fa-robot');
            } else if (creatorFirstPart === 'dall-e' || creatorFirstPart === 'dalle') {
              platformIcon.classList.add('fa-palette');
            } else if (creatorFirstPart === 'stable') {
              platformIcon.classList.add('fa-wand-magic-sparkles');
            } else if (creatorFirstPart === '即梦ai') {
              platformIcon.classList.add('fa-cloud');
            } else {
              platformIcon.classList.add('fa-image');
            }
          }
        } else {
          console.error('无法找到索引为', index, '的图片数据');
        }
      } else {
        console.error('图片索引无效:', index);
      }
    });
  });
  
  // 复制提示词功能
  if (copyPromptBtn) {
    copyPromptBtn.addEventListener('click', function() {
      const promptText = modalPrompt.textContent;
      if (promptText) {
        // 使用现代Clipboard API
        try {
          navigator.clipboard.writeText(promptText).then(() => {
            // 显示复制成功提示
            copyPromptBtn.classList.add('success');
            copyPromptBtn.innerHTML = '<i class="detail-section__action-icon fa-solid fa-check"></i> 复制成功';
            
            // 2秒后恢复原始文本
            setTimeout(() => {
              copyPromptBtn.classList.remove('success');
              copyPromptBtn.innerHTML = '<i class="detail-section__action-icon fa-solid fa-copy"></i> 复制提示词';
            }, 2000);
          }).catch(err => {
            console.error('Clipboard API写入失败：', err);
            fallbackCopy();
          });
        } catch (err) {
          console.warn('Clipboard API不可用，使用备用方法', err);
          fallbackCopy();
        }
      }
      
      // 备用复制方法
      function fallbackCopy() {
        const textarea = document.createElement('textarea');
        textarea.value = promptText;
        textarea.style.position = 'fixed';  // 避免滚动到底部
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        
        try {
          const successful = document.execCommand('copy');
          if (successful) {
            copyPromptBtn.classList.add('success');
            copyPromptBtn.innerHTML = '<i class="detail-section__action-icon fa-solid fa-check"></i> 复制成功';
            
            setTimeout(() => {
              copyPromptBtn.classList.remove('success');
              copyPromptBtn.innerHTML = '<i class="detail-section__action-icon fa-solid fa-copy"></i> 复制提示词';
            }, 2000);
          } else {
            copyPromptBtn.innerHTML = '<i class="detail-section__action-icon fa-solid fa-times"></i> 复制失败';
            setTimeout(() => {
              copyPromptBtn.innerHTML = '<i class="detail-section__action-icon fa-solid fa-copy"></i> 复制提示词';
            }, 2000);
          }
        } catch (e) {
          console.error('复制失败:', e);
          copyPromptBtn.innerHTML = '<i class="detail-section__action-icon fa-solid fa-times"></i> 复制失败';
          setTimeout(() => {
            copyPromptBtn.innerHTML = '<i class="detail-section__action-icon fa-solid fa-copy"></i> 复制提示词';
          }, 2000);
        }
        
        document.body.removeChild(textarea);
      }
    });
  }
  
  // 关闭模态框
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }
  
  // 点击模态框外部关闭
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // 按ESC键关闭
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
  
  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // 恢复背景滚动
  }
}

// 初始化过滤器和排序
function initFilters() {
  const filters = document.querySelectorAll('.gallery-filter');
  const sortSelect = document.querySelector('.gallery-sort__select');
  
  if (filters.length > 0) {
    filters.forEach(filter => {
      filter.addEventListener('click', function() {
        // 移除其他过滤器的活动状态
        filters.forEach(f => f.classList.remove('active'));
        
        // 添加当前过滤器的活动状态
        this.classList.add('active');
        
        // 获取过滤值
        activeFilter = this.getAttribute('data-filter');
        
        // 应用过滤
        applyFilters();
      });
    });
  }
  
  if (sortSelect) {
    sortSelect.addEventListener('change', function() {
      applyFilters();
    });
  }
}

// 应用过滤和排序
function applyFilters() {
  const grid = document.getElementById('gallery-masonry');
  if (!grid || !window.galleryData) return;
  
  // 获取排序方式
  const sortSelect = document.querySelector('.gallery-sort__select');
  const sortBy = sortSelect ? sortSelect.value : 'default';
  
  // 过滤和排序数据
  // 创建带有原始索引的数据
  let filteredData = window.galleryData.map((item, index) => ({
    ...item,
    originalIndex: index
  }));
  
  // 应用过滤
  if (activeFilter !== 'all') {
    filteredData = filteredData.filter(item => {
      // 获取creator的第一段（如果有空格就取空格前的部分）
      const creatorFirstPart = item.creator.split(' ')[0];
      
      // 根据筛选条件过滤
      if (activeFilter === 'midjourney') return creatorFirstPart.toLowerCase() === 'midjourney';
      if (activeFilter === 'dalle') return creatorFirstPart.toLowerCase() === 'dall-e' || creatorFirstPart.toLowerCase() === 'dalle';
      if (activeFilter === 'stable') return creatorFirstPart.toLowerCase() === 'stable';
      if (activeFilter === '即梦ai') return creatorFirstPart === '即梦AI' || creatorFirstPart === '即梦ai';
      return true;
    });
  }
  
  // 应用排序
  if (sortBy === 'creator') {
    filteredData.sort((a, b) => {
      // 按creator的第一段排序
      const aFirstPart = a.creator.split(' ')[0];
      const bFirstPart = b.creator.split(' ')[0];
      return aFirstPart.localeCompare(bFirstPart);
    });
  }
  
  // 更新网格
  updateGrid(filteredData);
}

// 更新网格内容
function updateGrid(data) {
  const grid = document.getElementById('gallery-masonry');
  if (!grid) return;
  
  // 清空网格
  grid.innerHTML = '';
  
  // 计算合适的列宽
  const containerWidth = grid.parentNode.clientWidth || grid.clientWidth;
  const columnWidth = calculateOptimalColumnWidth(containerWidth);
  
  // 重新填充网格
  data.forEach((item, index) => {
    const gridItem = document.createElement('div');
    gridItem.className = 'gallery-item';
    // 使用原始索引，确保模态框显示正确的图片
    gridItem.setAttribute('data-index', item.originalIndex !== undefined ? item.originalIndex : index);
    gridItem.style.width = `${columnWidth}px`;
    
    gridItem.innerHTML = `
      <img src="${item.img_link}" alt="${item.prompt}" class="gallery-item__image" loading="lazy">
      <div class="gallery-item__info">
        <span class="gallery-item__creator">${item.creator}</span>
        <p class="gallery-item__prompt">${item.prompt}</p>
      </div>
    `;
    
    grid.appendChild(gridItem);
  });
  
  // 设置一个标记，存储当前列宽
  grid.setAttribute('data-column-width', columnWidth);
  
  // 重新初始化瀑布流
  imagesLoaded(grid, function() {
    // 获取存储的列宽，确保使用一致的列宽
    const storedColumnWidth = parseInt(grid.getAttribute('data-column-width')) || columnWidth;
    
    // 设置固定的gutter值
    const gutter = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--gap-lg')) || 15;
    
    if (masonry) {
      // 更新配置确保使用同样的列宽
      masonry.options.columnWidth = storedColumnWidth;
      masonry.options.gutter = gutter;
      
      // 重新加载并布局
      masonry.reloadItems();
      masonry.layout();
    } else {
      masonry = new Masonry(grid, {
        itemSelector: '.gallery-item',
        columnWidth: storedColumnWidth,
        percentPosition: false,
        gutter: gutter,
        fitWidth: true,
        transitionDuration: '0.4s'
      });
    }
    
    // 重新添加点击事件
    initModalEvents();
    
    // 淡入动画
    document.querySelectorAll('.gallery-item').forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('fade-in');
      }, index * 30);
    });
  });
}

// 初始化图片加载动画
function initImageLoadAnimations() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  galleryItems.forEach(item => {
    const img = item.querySelector('img');
    if (img) {
      if (img.complete) {
        item.classList.add('loaded');
      } else {
        img.addEventListener('load', () => {
          item.classList.add('loaded');
        });
      }
    }
  });
}

// 初始化分页
function initPagination() {
  // 此处可以实现分页逻辑
  // 这里仅作为示例
}

// imagesLoaded polyfill (简化版)
function imagesLoaded(container, callback) {
  const images = container.querySelectorAll('img');
  let loaded = 0;
  
  // 如果没有图片，直接调用回调
  if (images.length === 0) {
    callback();
    return;
  }
  
  function imageLoaded() {
    loaded++;
    if (loaded === images.length) {
      callback();
    }
  }
  
  images.forEach(img => {
    if (img.complete) {
      imageLoaded();
    } else {
      img.addEventListener('load', imageLoaded);
      img.addEventListener('error', imageLoaded);
    }
  });
} 