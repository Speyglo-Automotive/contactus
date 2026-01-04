(function(){
  'use strict'

  document.addEventListener('DOMContentLoaded', function(){
    // Stamp current year in footer
    var y = new Date().getFullYear();
    var el = document.getElementById('year');
    if(el) el.textContent = y;

    // Loader timing and early exits
    var body = document.body;
    var loader = document.getElementById('loader');
    var removeTimer = null;
    var failSafeTimer = null;

    var hideLoader = function(){
      if(!loader) return;
      loader.classList.add('done');
      if(removeTimer) clearTimeout(removeTimer);
      removeTimer = setTimeout(function(){
        if(loader && loader.parentNode) loader.parentNode.removeChild(loader);
      }, 450);
      if(failSafeTimer) clearTimeout(failSafeTimer);
    };

    if(!loader || body.hasAttribute('data-disable-loader')){
      hideLoader();
      return;
    }

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduce){
      hideLoader();
      return;
    }

    // Match loader duration to CSS custom property
    var cssDuration = (getComputedStyle(document.documentElement).getPropertyValue('--loader-duration') || '2.6s').trim();
    var durationMS = 2600; // fallback
    var m = cssDuration.match(/([\d.]+)\s*(ms|s)/);
    if(m){
      durationMS = Math.round(parseFloat(m[1]) * (m[2] === 's' ? 1000 : 1));
    }

    setTimeout(hideLoader, durationMS);
    failSafeTimer = setTimeout(hideLoader, Math.max(durationMS + 800, 2600));

    // Fallback if loader logo fails to load
    var loaderImg = document.getElementById('loader-logo');
    if(loaderImg){
      loaderImg.addEventListener('error', function onLoaderError(){
        var src = loaderImg.getAttribute('src') || '';
        if(!src.includes('assets/images/')){
          loaderImg.src = 'assets/images/L.svg';
          return;
        }
        if(src.includes('/')){
          loaderImg.src = src.split('/').pop();
          return;
        }
        if(/\.svg$/i.test(src)){
          loaderImg.src = src.replace(/\.svg$/i, '.png');
          return;
        }
      }, {once: true});
    }

    // Unbox the logo once social icons are ready
    (function waitForSocialIcons(){
      var socialImgs = Array.prototype.slice.call(document.querySelectorAll('.social img'));
      var wrapper = document.querySelector('.brand-logo-wrapper');

      if(!wrapper) return; // nothing to do if wrapper missing

      if(socialImgs.length === 0){
        wrapper.classList.add('unboxed');
        return;
      }

      var loaded = 0;
      var done = function(){
        wrapper.classList.add('unboxed');
      };

      var fallbackTimer = setTimeout(done, 4000);

      socialImgs.forEach(function(img){
        if(img.complete && img.naturalWidth !== 0){
          loaded++;
          if(loaded === socialImgs.length){
            clearTimeout(fallbackTimer);
            done();
          }
        } else {
          img.addEventListener('load', function(){
            loaded++;
            if(loaded === socialImgs.length){
              clearTimeout(fallbackTimer);
              done();
            }
          });
          img.addEventListener('error', function(){
            loaded++;
            if(loaded === socialImgs.length){
              clearTimeout(fallbackTimer);
              done();
            }
          });
        }
      });
    })();

    // Generic image fallbacks for flat hosting
    (function imageFallbacks(){
      function filenameOnly(url){
        if(!url) return null;
        try { var parts = url.split('/'); return parts.length ? parts[parts.length-1] : null; } catch(e){ return null; }
      }

      document.querySelectorAll('img').forEach(function(img){
        img.addEventListener('error', function onErr(){
          if(img.dataset.__fallbackAttempted === '1'){
            img.removeEventListener('error', onErr);
            return;
          }
          img.dataset.__fallbackAttempted = '1';

          var src = img.getAttribute('src') || '';
          var flat = filenameOnly(src);
          if(flat && flat !== src){ img.src = flat; return; }

          if(/\.svg$/i.test(src)){
            img.src = src.replace(/\.svg$/i, '.png');
            return;
          }
          img.removeEventListener('error', onErr);
        }, {passive:true});
      });

      document.querySelectorAll('picture source').forEach(function(source){
        var s = source.getAttribute('srcset') || '';
        var flat = filenameOnly(s);
        if(flat && flat !== s){
          source.setAttribute('data-srcset-original', s);
          source.setAttribute('data-srcset-flat', flat);
        }
      });

      document.querySelectorAll('picture img').forEach(function(img){
        img.addEventListener('error', function tryPictureFlat(){
          var picture = img.parentElement;
          if(!picture) return;
          var sources = picture.querySelectorAll('source');
          var tried = false;
          sources.forEach(function(srcEl){
            var flat = srcEl.getAttribute('data-srcset-flat');
            if(flat){ tried = true; srcEl.setAttribute('srcset', flat); }
            else {
              var orig = srcEl.getAttribute('srcset') || '';
              var derived = filenameOnly(orig);
              if(derived && derived !== orig){ tried = true; srcEl.setAttribute('srcset', derived); }
            }
          });
          if(tried){
            var cur = img.getAttribute('src') || '';
            var flatImg = filenameOnly(cur);
            if(flatImg && flatImg !== cur){ img.src = flatImg; }
            else if(/\.svg$/i.test(cur)){ img.src = cur.replace(/\.svg$/i, '.png'); }
          }
        }, {passive:true});
      });

    })();

    // Optional: Expose helper to disable loader programmatically
    window.Speyglo = window.Speyglo || {};
    window.Speyglo.disableLoader = function(){
      if(loader) loader.classList.add('hidden');
    }

  });

})();
