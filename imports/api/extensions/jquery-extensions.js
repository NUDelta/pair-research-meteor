import { $ } from 'meteor/jquery';

$.fn.inputTooltip = function() {
  const $hook = $(this.data('focus'));
  $hook.focus(() => {
    this.addClass('animated fadeIn');
    this.show();
    this.removeClass('fadeOut');
  });
  $hook.blur(() => {
    this.addClass('animated fadeOut', () => {
      this.hide();
      this.removeClass('fadeIn');
    });
  });
  return this;
};

