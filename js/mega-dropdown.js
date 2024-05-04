// button dropdown component
if (!customElements.get('dropdown-component')) {
  customElements.define('dropdown-component', class DropdownComponent extends HTMLElement {
    constructor() {
      super();
      
      if(this.dataset.desktopHidden === 'true' && screen.width > 767) return;
      this.button = this.querySelector('.dropdown-component_opener:not(.hidden)');
      this.content = this.querySelector('.dropdown-component_wrapper');
      this.onButtonClick = this.toggleDropdown.bind(this);
      this.shareEvent = this.copyToClipboard.bind(this);
      this.shareClose = this.close.bind(this);
      this.onBodyClick = this.onBodyClick.bind(this);
      this.onKeyUp = this.onKeyUp.bind(this);
      this.button.addEventListener('click', this.onButtonClick);

      if(this.dataset.submission === 'true'){
        this.input = this.querySelector('input');
        const itemsArr = this.content.querySelectorAll('.dropdown-component_btn-submit');
        if(!itemsArr) return;
        itemsArr.forEach(item => {item.addEventListener('click', this.onItemClick.bind(this));});
      }
      
      if(this.dataset.sorting === 'true'){
        const itemsArr = this.content.querySelectorAll('.dropdown-component_btn-sort');
        if(!itemsArr) return;
        itemsArr.forEach(item => {item.addEventListener('click', this.onSort.bind(this));});
      }
      
      if(this.dataset.share === 'true'){
        this.elements = {
          successMessage: this.querySelector('.shareMessage'),
          closeButton: this.querySelector('.share-button__close'),
          shareButton: this.querySelector('.share-button__copy'),
          urlInput: this.querySelector('.shareUrl')
        }
        if(navigator.share){
          this.button.removeEventListener('click', this.onButtonClick);
          this.button.addEventListener('click', () => { navigator.share({ url: this.elements.urlInput.value, title: document.title }); });
          return;
        }
      }
      
      this.setIndexing(false);
    }

    toggleDetails(){
      if(!this.dataset.share) return;
      this.elements.successMessage.classList.add('hidden');
      this.elements.successMessage.textContent = '';
      this.elements.closeButton.classList.add('hidden');
    }

    copyToClipboard(){
      if(!this.dataset.share) return;
      navigator.clipboard.writeText(this.elements.urlInput.value).then(() => {
        this.elements.successMessage.classList.remove('hidden');
        this.elements.successMessage.textContent = window.accessibilityStrings.shareSuccess;
        this.elements.closeButton.classList.remove('hidden');
      });
      this.elements.closeButton.addEventListener('click', this.shareClose);
    }

    open(){
      this.button.setAttribute('aria-expanded', true);
      this.content.focus();
      this.content.classList.add('dropdown--open');
      const focusables = this.dataset.dropdownLevel === '2' ? this.querySelectorAll('a[data-level="2"],button[data-level="2"]') : this.querySelectorAll('a[data-level="1"],button[data-level="1"]');
      document.body.addEventListener('click', this.onBodyClick);
      this.addEventListener('keyup', this.onKeyUp);
      if(this.dataset.share === 'true'){
        if(!navigator.share){
          this.elements.shareButton.addEventListener('click', this.shareEvent);
        }
      }
      if(!focusables) return;
      this.setIndexing(true, focusables);
    }

    close(){
      this.button.setAttribute('aria-expanded', false);
      this.content.classList.remove('dropdown--open');
      document.body.removeEventListener('click', this.onBodyClick);
      this.removeEventListener('keyup', this.onKeyUp);
      if(this.dataset.share === 'true'){
        if(navigator.share){
          this.elements.shareButton.removeEventListener('click', () => { navigator.share(); });
        
        } else{
          this.elements.shareButton.removeEventListener('click', this.shareEvent);
        }
        this.toggleDetails();
      }
      const focusables = this.dataset.dropdownLevel === '2' ? this.querySelectorAll('a[data-level="2"],button[data-level="2"]') : this.querySelectorAll('a[data-level="1"],button[data-level="1"]');
      if(!focusables) return;
      this.setIndexing(false, focusables);
    }

    toggleDropdown(event){
      if(event.target.getAttribute('aria-expanded') === 'true') return this.close();
      this.open();
    }

    onBodyClick(event){
      const target = event.target;
      if(this.contains(target) || target === this || target === this.button
        && this.button.getAttribute('aria-expanded') === 'true') return;
      
      if(this.dataset.dropdownLevel === '2'){
        event.stopPropagation();
        this.close();
        return;
      }

      this.close();
    }

    onKeyUp(event){
      if(event.code.toUpperCase() !== 'ESCAPE') return;
      
      if(this.dataset.dropdownLevel === '2'){
        event.stopPropagation();
        this.close();
        return;
      }
      this.close();
      this.button.focus();
    }

    onItemClick(event) {
      event.preventDefault();
      const form = document.getElementById(this.dataset.formId);
      if(this.input) this.input.value = event.currentTarget.dataset.value;
      if (this.input && form) form.submit();
    }
    
    onSort(event){
      event.preventDefault();
      const sortInput = document.getElementById(this.dataset.inputId);
      let form = document.querySelector('.filters-sidebar filters-form form');
      if(!form) form = document.querySelector('#filters-form');
      if(!sortInput || !form) return;
      const value = event.target.dataset.value;
      const text = event.target.firstChild.textContent;
      this.button.firstChild.textContent = text;
      sortInput.value = value;
      form.dispatchEvent(new Event('input'));
    }
    
    setIndexing(flag, arr = null){
      const focusables = arr ? arr : this.content.querySelectorAll('a[data-level],button[data-level]');
      if(!focusables) return;
      focusables.forEach(element => {
        indexing(flag, element);
      });
      
      function indexing(condition, element){
        if(condition){
          element.removeAttribute('tabindex');
        
        } else{
          element.setAttribute('tabindex', '-1');
        }
      }
    }
  });
}



