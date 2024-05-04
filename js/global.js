if (!customElements.get('quantity-input')) {
  customElements.define('quantity-input', class QuantityInput extends HTMLElement {
    constructor() {
      super();
      this.input = this.querySelector('input');
      this.changeEvent = new Event('change', { bubbles: true });
      this.qtySubtotal = this.querySelector('.quantity_subtotal');

      this.input.addEventListener('change', this.onInputChange.bind(this));
      this.querySelectorAll('button').forEach(
        (button) => button.addEventListener('click', this.onButtonClick.bind(this))
      );
    }

    quantityUpdateUnsubscriber = undefined;

    connectedCallback() {
      if(this.qtySubtotal) this.initQtyPrice = this.qtySubtotal.innerText;
      
      // this.validateQtyRules();
      this.quantityUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.quantityUpdate, this.validateQtyRules.bind(this));
    }

    disconnectedCallback() {
      if (this.quantityUpdateUnsubscriber) {
        this.quantityUpdateUnsubscriber();
      }
    }

    onInputChange() {
      this.validateQtyRules();
    }

    onButtonClick(event) {
      event.preventDefault();
      const previousValue = this.input.value;
      
      if(event.target.name === 'plus' || event.target.parentElement.name === 'plus'){
        this.input.stepUp();
      
      } else{
        this.input.stepDown();
      }

      // event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
      if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
    }

    validateQtyRules(variant = null) {
      const value = parseInt(this.input.value);
      
      if(variant){
        this.setVariantUpdates(value, variant);
        
        return;
      }
      
      if (this.input.min) {
        const min = parseInt(this.input.min);
        const buttonMinus = this.querySelector(".quantity_button[name='minus']");
        buttonMinus.classList.toggle('disabled', value <= min);
        buttonMinus.toggleAttribute('disabled', value <= min);
      }
      if (this.input.max) {
        const max = parseInt(this.input.max);
        const buttonPlus = this.querySelector(".quantity_button[name='plus']");
        buttonPlus.classList.toggle('disabled', value >= max);
        buttonPlus.toggleAttribute('disabled', value >= max);
      }
      
      if(this.qtySubtotal){
        const parentCard = this.closest('product-card');
        const currPrice = parentCard.getCurrentPriceData();
        let multiplePrice = currPrice * value;
        
        if(value > 1){
          this.qtySubtotal.innerText = Shopify.formatMoney(multiplePrice, window.money_format);
          
          return;
        }
        
        multiplePrice = currPrice * 1;
        this.qtySubtotal.innerText = Shopify.formatMoney(multiplePrice, window.money_format);
      }
    }
    
    setVariantUpdates(val, rule){
      const minVal = rule.min;
      const maxVal = rule.max;
      const incrVal = rule.increment;
      
      if (this.input.min){
        this.input.setAttribute('min', minVal);
        const min = parseInt(minVal);
        const buttonMinus = this.querySelector(".quantity_button[name='minus']");
        buttonMinus.classList.toggle('disabled', val <= min);
        buttonMinus.toggleAttribute('disabled', val <= min);
      }
      if (this.input.max){
        this.input.setAttribute('max', maxVal);
        const max = parseInt(maxVal);
        const buttonPlus = this.querySelector(".quantity_button[name='plus']");
        buttonPlus.classList.toggle('disabled', val >= max);
        buttonPlus.toggleAttribute('disabled', val >= max);
      }
      
      if(this.qtySubtotal){
        const parentCard = this.closest('product-card');
        const currPrice = parentCard.getCurrentPriceData();
        const multiplePrice = currPrice * val;
        this.qtySubtotal.innerText = Shopify.formatMoney(multiplePrice, window.money_format);
      }
    }
    
    setResetSubtotals(price){
      if(!this.qtySubtotal) return;
      this.qtySubtotal.innerText = Shopify.formatMoney(price, window.money_format);
    }
    
    resetDefaults(price = null){
      this.input.value = parseInt(this.input.min);
      if(price) this.setResetSubtotals(price);
    }
    
    toggleSubtotal(status){
      if(!this.qtySubtotal) return;
      
      if(!status){
        this.qtySubtotal.classList.add('hidden');
      
      } else{
        this.qtySubtotal.classList.remove('hidden');
      }
    }
  });
}