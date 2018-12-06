let result = (function() { 


window.__ignoreHashChange = 0;
function installHashChangeHandler() {
	window.addEventListener('hashchange', function() {
		if (window.__ignoreHashChange === 0) {
			if (window._dialog && window._dialog.hasChangedValues()) {
				if (!window._dialog.confirmLeave()) {
				} else {
					goToCurrentTabOrDefault();
				}
			} else {
				goToCurrentTabOrDefault();
			}

		}
	});

	$(window).bind('beforeunload', function(e) {
		if (window._dialog && window._dialog.hasChangedValues()) {
			return true
		}
	});
}

function setLocationHashStealthily(hash) {
	window.__ignoreHashChange++;
	location.hash = hash;
	setTimeout(function() {
		window.__ignoreHashChange--;
	}, 1);
}

function goToCurrentTabOrDefault(defaultTab) {
	var $currentTabButton = location.hash && $('.tabButton-' + location.hash.slice(1));
	if ($currentTabButton.length) {
		$currentTabButton.first().trigger('click');
	} else {
		if (defaultTab) {
			location.hash = defaultTab;
		} else {
			$('.tabButton').first().trigger('click');
		}
	}
}

function createAlignMiddle(content) {
	var container = $('<div>').css({
		display: 'table'
	});
	var cell = $('<div>').css({
		display: 'table-cell',
		'vertical-align': 'middle'
	}).appendTo(container);

	cell.append(content);

	return container;
}

function createTabButton(text, callback, tabName, linkHref) {
	var button = $('<div>').text(text).addClass('tabButton');

	if (tabName !== undefined) {
		button.addClass('tabButton-' + tabName);
		button.attr('tabButtonTabName', tabName);
	}

	var clickCallback = function() {

		if (window._dialog && window._dialog.hasChangedValues()) {
			if (!window._dialog.confirmLeave()) {
				return;
			}
		}

		if (linkHref && window.redirect) {
			redirect(linkHref);
			return;
		}

		button.blur();
		if (button.attr('disabled')) return;
		callback(button.hasClass('selected'));
		window.scrollTo(0, 0);
		$('.tabButton').removeClass('selected');
		$('.topBar .topBarMenu').removeClass('visible').hide();
		$('.topBarMenuModalLayer').remove();

		if (tabName !== undefined) {
			setTimeout(function() {
				$('.tabButton-' + tabName).addClass('selected');
				$('#provider .topBar .topBarTitle').text(text).show();
			}, 0);

			if (tabName)
				setLocationHashStealthily(tabName);
			else
				removeHash();
		} else {
			setTimeout(function() {
				button.addClass('selected');
			}, 0);
			removeHash();
		}

		$('body').removeClass('freeze-scroll');
	};

	if (callback !== null){
		button.on('click', clickCallback);
	}

	button.copyTabButton = function() {
		return createTabButton(text, callback, tabName);
	}

	if (!text) button.hide();

	return button;
}

function createIconButton(iconUrl, callback) {
	var img = $('<img>').attr('src', iconUrl).addClass('iconButton');
	img.click(function(event) {
		img.blur();
		if (img.attr('disabled')) return;
		callback(event);

	});
	return img;
}

function createImageWithTextButton(imgUrl, text, callback) {
	var div = $('<div>').addClass('imageWithTextButtonContainer').click(function() {
		div.blur();
		if (div.attr('disabled')) return;
		callback();
	});
	$('<img>').attr('src', imgUrl).appendTo(div);
	$('<div>').addClass('imageWithTextButtonText').text(text).appendTo(div);
	return div;
}

function createTextButton(text, callback, href, targetBlank) {
	var button = $(href ? '<a>' : '<span>').text(text).addClass('textButton');
	if (href) {
		button.attr('href', href);

		if (targetBlank)
			button.attr('target', '_blank');
	}
	button.click(function(e) {
		if (button.attr('disabled')) {
			e.preventDefault();
			return;
		}
		callback(e);
	});
	return button;
}

// unused
function createModalButton(text, callback) {
	var button = $('<button>').addClass('modal-button').attr('text', text).text(text).click(function(e) {
		e.stopPropagation();
		e.preventDefault();
		button.blur();
		if (button.attr('disabled')) return;
		callback();
	});
	return button;
}

// unused
function createBigButton(text, callback) {
	var button = $('<button>').text(text).addClass('bigButton');
	var clickCallback = function() {
		button.blur();
		if (button.attr('disabled')) return;
		callback();
	}
	button.click(clickCallback);
	return button;
}

function createBasicButton(text, callback, optionalExtraClass) {
	var button = $('<button>').text(text).addClass('basicButton').click(function(e) {
		e.stopPropagation();
		e.preventDefault();
		button.blur();
		if (button.attr('disabled')) return;
		callback(e);
	});
	if (optionalExtraClass) {
	}
	button.addClass(optionalExtraClass);
	return button;
}

function createNavigationButton(text, callback, iconUrl) {
	var button = $('<div>').addClass('navigationButton selectNone').click(function(e) {
		e.stopPropagation();
		e.preventDefault();
		button.blur();
		if (button.attr('disabled')) return;
		callback(e);
	});

	button.append($('<span>').addClass('navigationButtonText').text(text));
	if (iconUrl) {
		button.append($('<img>').addClass('navigationButtonIcon').attr({
			src: iconUrl
		}));
	}
	button.append($('<img>').addClass('navigationButtonArrowIcon').attr({
		src: '/common/img/icon_arrow_small.png'
	}));

	return button;
}

function addModalLayer(clickCallback, className) {
	$('body').append($('<div>').addClass('modalLayer' + (className ? ' ' + className : '')).click(function() {
		$(this).remove();
		if (clickCallback)
			clickCallback();
	}));
}

function createTopBar(tabs, options) {
	options = $.extend({
		logo: true,
		language: true,
		logoutCallback: null,
		burgerMenuWidthLimit: 800,
		container: $('body'),
	}, options);

	var confirmedLogoutCallback = function() {
		if (options && options.logoutCallback) {
			if (confirm(lang.logout.reallyLogOut)) {
				options.logoutCallback();
			}
		}
	}

	var topBar = $('<div>').addClass('topBar');
	$('<div>').addClass('topBarTitle').appendTo(topBar).hide();

	var menuContainer = $('<div>').addClass('topBarMenu').appendTo(topBar);

	var burgerButton = $('<div>').addClass('topBarBurgerButton').append($('<img>').attr('src', '/common/img/burger_icon.svg')).click(toggleTopBarMenu);
	topBar.append(burgerButton);
	var burgerViewAvailable = options.logoutCallback || tabs;

	var view = '';

	function setBurgerView(isBurgerView) {
		if (isBurgerView && burgerViewAvailable) {
			if (view == 'burger') return;
			view = 'burger';
			$('.topBarElement').hide();
			//menuContainer.hide();
			/* menuContainer.css('transform', 'translateY(-100vh)'); */
			menuContainer.removeClass('visible')
			burgerButton.show();
			//logo.removeClass("logoLeft");
			logo.addClass('logoLeft');
			$('.topBarMenuModalLayer').remove();
		} else {
			if (view == 'normal') return;
			view = 'normal';
			$('.topBarElement').show();
			//menuContainer.hide();
			/* menuContainer.css('transform', 'translateY(-100vh)'); */
			burgerButton.hide();
			if (tabs) logo.addClass('logoLeft');
			$('.topBarMenuModalLayer').remove();
		}
	}

	function resizeCallback() {
		var burgerEnabled = $(window).width() < options.burgerMenuWidthLimit;

		if (window.intercomUpdate) {
			intercomUpdate({
				hide_default_launcher: burgerEnabled
			})
		}
		setBurgerView(burgerEnabled);
	}

	if (burgerViewAvailable)
		$(window).resize(resizeCallback);
	//setTimeout(resizeCallback, 1);

	function toggleTopBarMenu() {
		if (menuContainer.hasClass('visible')) {
			menuContainer.removeClass('visible');
			$('.topBarMenuModalLayer').remove();
			$('.topBarTitle').show();

			$('body').removeClass('freeze-scroll');
			topBar.removeClass('menu-open')
		}
		else {
			$('body').addClass('freeze-scroll');
			topBar.addClass('menu-open')
			menuContainer.addClass('visible');
			$('.topBarTitle').hide();
			addModalLayer(function() {
				menuContainer.removeClass('visible');
			}, 'topBarMenuModalLayer');
		}
	}

	if (tabs && tabs.length > 0) {
		setTimeout(function() {
			var defaultTabName = tabs[0].attr('tabButtonTabName');
			installHashChangeHandler();
			goToCurrentTabOrDefault(defaultTabName);
		}, 10);

		var tabContainer = $('<div>').addClass('tabContainer topBarElement').appendTo(topBar);
		tabContainer.append(tabs);

		var tabCopies = tabs.map(function(tab) {
			return tab.copyTabButton();
		});
		menuContainer.append(tabCopies);
	}

	if (options.logo) {
		var logoUrl = '/common/img/resq_logo.png';
		var logo = $('<a>').attr('href', '/').addClass('logo ' + (tabs ? ' logoLeft' : '')).append($('<img>').attr('src', logoUrl)).appendTo(topBar);
	}
	if (options.language) {
		topBar.append(createLanguageController().addClass('topBarElement'));
		menuContainer.append(createLanguageController());
	}
	if (options.logoutCallback) {
		var logoutText = window.lang ? lang.p.button.logout : 'Log out';
		topBar.append(createTextButton(logoutText, confirmedLogoutCallback).addClass('topBarElement topBarLogoutButton'));
		menuContainer.append(createTabButton(logoutText, options.logoutCallback).addClass('topBarLogoutButton'));
	}

	topBar.css({ visibility: 'hidden' }).prependTo(options.container).css({ visibility: 'visible' });
	resizeCallback();

	var ENABLE_DEV_TOP_BAR = false;
	if (ENABLE_DEV_TOP_BAR && window.env && use.env.DEV_ENV) {
		topBar.css({
			'background': '#4B6827',
		});
		if (logo) {
			logo.text('DEV Environment');
		}
	}

	return topBar;
}

function createLanguageController() {
	var languageSelectorContainer = $('<div>').addClass('languageSelector-touchArea');

	var languageSelectorCurrent = $('<div />').addClass('current-lang')
	var language = getLanguage();
	var languageSelector = $('<div>').addClass('languageSelector');

	languageSelectorCurrent.append($('<div class="text-allcaps">').text(language).css('display', 'inline-block'));
	languageSelectorCurrent.append($('<span class="icon-arrow-down">').css('margin-left', 4));
	//languageSelectorCurrent.append($('<span />').addClass('icon-arrow-down'));
	languageSelectorContainer.append(languageSelectorCurrent)
	window.wait.env.then(function() {
		var languages = use.env.SUPPORTED_LANGUAGES;
		var otherLanguages = languages.slice();
		var currentLanguage = otherLanguages.indexOf(language);
		/*
		 if (currentLanguage !== -1) {
		 otherLanguages.splice(currentLanguage, 1);
		 }
		 */
		otherLanguages.forEach(function(language) {
			var languageContainer = $('<div>');
			languageContainer.addClass('language')
			languageContainer
			//.append($('<span class="language-long"></span>'))
			.append($('<span class="language-short text-allcaps">' + language + '</span>'));

			languageSelector.append(languageContainer);
		});
	});

	languageSelector.on('click', 'div', function(ev) {
		//.find('.language-short')
		var nextLang = $(ev.target).text().toLowerCase();
		if (nextLang && nextLang !== language) {
			setLanguageAndRedirect(nextLang);
		}
	});

	languageSelectorContainer.click(function(ev) {
		languageSelectorContainer.toggleClass('open');
		ev.stopPropagation();
	});
	$('html').click(function() {
		languageSelectorContainer.removeClass('open');
	});
	languageSelectorContainer.append(languageSelector);

	return languageSelectorContainer;
}

// Input stuff
//////////////////////////////

function validateTime(input) {
	var val = input.val();
	var vals = val.split(':');
	var ok = false;
	var newVal = null;

	if (val == '') {
		newVal = '';
	}
	else if (vals.length >= 2) {
		var val1 = parseInt(vals[0]);
		var val2 = parseInt(vals[1]);
		if (!isNaN(val1) && val1 >= 0 && val1 < 24) {
			val1 = ('0' + val1).slice(-2);

			if (!isNaN(val2) && val2 >= 0 && val2 < 60) {
				val2 = ('0' + val2).slice(-2);
			}
			else
				val2 = '00';

			newVal = val1 + ':' + val2;
		}
	}
	else if (vals.length == 1) {
		var val = parseInt(vals[0]);
		if (!isNaN(val) && val >= 0 && val < 24) {
			newVal = ('0' + val).slice(-2) + ':00';
		}
	}

	if (newVal) {
		input.val(newVal);
		input.data('val', newVal);
	}
	else {
		input.val(input.data('val'));
	}
}
function validateTimeOld(input) {
	input.data('val', input.val());
	input.change(function() {
		validateTime(input);
	});
}
function validateAmount(input) {
	input.data('oldVal', input.val());
	input.change(function() {
		var val = input.val();
		if (val == '') {
			input.data('oldVal', val);
			return;
		}
		var num = parseInt(val);
		if (isNaN(num) || num <= 0) {
			input.val(input.data('oldVal'));
		}
		else {
			input.val(num);
			input.data('oldVal', input.val());
		}
	});
	input.change();
}

function validateLocation(input) {
	input.data('oldVal', input.val());

	function handler() {
		var val = input.val();
		if (val == '') {
			input.data('oldVal', val);
			input.val('');
			return;
		}
		var num = parseFloat(val);
		if (isNaN(num) || num < -180 || num > 180) {
			input.val(input.data('oldVal'));
		}
		else {
			input.val(num);
			input.data('oldVal', input.val());
		}
	}

	input.change(handler);
	handler();
}

function createInputLabel(title, subTitle, options) {
	if (subTitle) subTitle = ' (' + subTitle + ')';
	else subTitle = '';

	var el = $('<div>').addClass('inputBlockTitle').text(title + subTitle);
	if (options && options.collapse) {
		el = $('<a href="">').addClass('inputBlockTitle').text(title + subTitle);
	}
	el.click(function(e) {
		e.preventDefault();
	})
	return el;
}

function createSimpleInputBlock(localizationObject, type, defaultValue, horizontalAlign, width) {
	if (!localizationObject)
		localizationObject = {};
	else if (typeof localizationObject == 'string')
		localizationObject = { title: localizationObject };
	var title = localizationObject.title || '';
	var name = title.replace(/[ -]/g, '_') || ('' + Math.random());
	var placeholder = localizationObject.placeholder || '';
	return createInputBlockOld(name, title, placeholder, type, defaultValue, horizontalAlign, width);
}

function createInputBlock(options) {

	var defaultOptions = {
		label: '', // overrides localization
		placeholder: '', // overrides localization
		localization: '', // string or { label: "", placeholder: "" }
		size: 'full', // full/half/halfRight/auto/fixed
		blockClass: '',
		inputClass: '',
		type: 'text', // select option type is: [{ id: "fi", name: "Finland" }, ...]
		value: '', // default value,
		helpText: '',
		tabIndex: -1,
		required: false,
		optional: false,
		disabled: false
	};
	options = $.extend(defaultOptions, options);

	var block = $('<div>').addClass('inputBlock inputBlock-' + options.size + ' inputBlock-type-' + options.type);

	if (options.required){
		block.addClass('required')
	}
	var blockContent = $('<div>').addClass('inputBlockContent');

	if (options && options.collapse) {
		block.addClass('inputBlock-collapse')
	}
	if (options && options.disabled) {
		block.addClass('inputBlock-disabled')
	}
	if (options.blockClass) block.addClass(options.blockClass);

	var label = options.label || options.localization && options.localization.label;

	var labelSummary = $('<span></span>');
	labelSummary.addClass('inputBlock-label-summary');

	if ('price' === options.type && options.value) {
		labelSummary.text(isNaN(options.value) ? '' : (options.value / 100));
	} else {
		labelSummary.text(options.value);
	}

	//var inputBlockPlaceholder = $('<div>').addClass("placeholder").text("PLACEHOLDER").css('height', '58px');

	//var expandedBackgroundEl = $('<div>');
	if (label && !(options.type === 'checkbox2') && !(options.type === 'amountStepper')) {

		var inputLabel = createInputLabel('');

		var labelText = $('<span>').text(label).addClass('inputBlock-label-summary-label');
		if (options && options.optional){
			block.addClass('optional');
			labelText.attr('data-optional', lang.p.dialog.inputBlockLabel.optional);
			// console.warn('optional found in ', options.label, options)
		} else {
			// console.log('no optional found in ', options.label, options)
		}

		inputLabel.append(labelText);

		if (options && options.collapse) {
			var fullscreenInputLabel = $('<div>').addClass('inputBlockTitle');
			fullscreenInputLabel.append(labelText.clone())
			fullscreenInputLabel.css({
				position: 'absolute',
				top: '0',
				height: '60px',
				width: '100%'
			})
			fullscreenInputLabel.click(function() {
				block.trigger('collapse');
			})
			fullscreenInputLabel.hide();
			//block.append(fullscreenInputLabel);

			if (options.helpText) {
				var helpText = $('<div>').addClass('inputBlock-helpText');
				helpText.html(options.helpText);
				blockContent.append(helpText)
			}
			inputLabel.append(labelSummary)
		}

		block.append(inputLabel);
	}

	block.append(blockContent);
	var input;

	if (options.type === 'empty') {

	} else {
		input = createInput($.extend({}, options, {
			class: options.inputClass,
			width: '100%',
			placeholder: options.placeholder || options.localization && options.localization.placeholder,
		}));

		input.attr('tabindex', options.tabIndex)
		if (options && options.collapse) {
			input.on('focus', function() {
				$('body').addClass('input-focus')

				if (!block.hasClass('expanded')) {
					block.trigger('expand');
				}
				$('.modalBody.modalPopupSection').scrollTop($('.modalBody.modalPopupSection').data('original-scroll-top'))
				$('body').scrollTop(0);

				//$('.inputBlock-collapse.expanded').removeClass('expanded');
				//block.addClass("expanded");
			})
			input.on('blur', function() {
				$('body').removeClass('input-focus');
				if (block.hasClass('expanded')) {
//					block.trigger('collapse')
				}

			})
			var val = input.val();
			if (!val || val.length < 1) {
				val = options.placeholder;
			}
			labelSummary.text(val)

			input.on('change', function() {
				val = input.val();
				if (!val || val.length < 1) {
					val = options.placeholder;
				}
				labelSummary.text(val)
			})
		}
	}

	blockContent.append(input);
	if (options.type != 'empty') {

		block.data('changed', false);
		block.data('get', input.data('get'));
		block.data('set', input.data('set'));
		block.data('change', input.data('change'));
		block.data('type', input.data('type'));
		block.data('input', input);
		block.data('value', input.data('get')());
		input.data('change')(function() {
			block.data('changed', true);
			block.data('value', input.data('get')());
		});
	}

	// Clear button for search input must be added here
	if (options.type === 'search') {
		var clearSearch = $('<div class="clearSearch">&times;</div>');
		clearSearch.click(function() {
			input.val('');
			clearSearch.hide();
			if ($.isFunction(options.onChange)) {
				options.onChange();
			}
		});

		function handleInputChange() {
			if (input.val() === '') {
				clearSearch.hide();
			} else {
				clearSearch.show();
			}
			if ($.isFunction(options.onChange)) {
				options.onChange();
			}
		}

		input.keyup(handleInputChange);
		input.change(handleInputChange);

		blockContent.append(clearSearch.hide());
	}

	var touchEnabled = $('html').hasClass('touch');

	if (input) {
		input.on('keydown', function(e) {
			var code = e.keyCode || e.which

			if (input && input.is('textarea')) {
				return
			}

			if (13 === code) { //return key
				if (block.hasClass('expanded')) {
					var next = block.nextAll('div.inputBlock.inputBlock-collapse:first');
					if (next && next.length > 0) {
						next.trigger('expand')
					} else {
						block.trigger('collapse')
					}

				}
			}
		})
	}

	//detect dragging from clicking action when touch is enabled. we have
	// to hijack the touchend event in order to focus an input and show the keyboard on ios webkit

	var touchStartEvent;
	var initByTouch = false;
	var isDragging = false;
	var dragStartY;

	//handle collapsing & expanding on non touch devices. no input focus trickery needed.
	var ALWAYS_ENABLE_COLLAPSING = true;
	if (!touchEnabled || ALWAYS_ENABLE_COLLAPSING) {
		$(inputLabel).on('click', function(e) {
			if (initByTouch) {
				return;
			}
			if (block.hasClass('expanded')) {
				block.trigger('collapse')
			} else {
				block.trigger('expand');
				input && input.focus();
			}
		})
	}

	$(inputLabel).on('touchstart', function(e) {
		if (options.disabled){
			return
		}

		initByTouch = true;
		//mark the starting x position of a touch
		dragStartY = e.originalEvent.touches[0].screenY
		touchStartEvent = e;
		isDragging = false;
		inputLabel.addClass('active')

	});

	$(inputLabel).on('touchmove', function(e) {
		if (options.disabled){
			return
		}

		//detect dragging/scrolling
		if (Math.abs(dragStartY - e.originalEvent.touches[0].screenY) > 20) {
			inputLabel.removeClass('active')
			isDragging = true;
		}
	})
	$(inputLabel).on('touchend touchleave', function(e) {
		e.preventDefault();
		if (options.disabled){
			return
		}
		touchStartEvent = null;
		setTimeout(function() {
			initByTouch = false;
		}, 100)

		inputLabel.removeClass('active')
		if (isDragging) {
			//touch was detected as dragging
			return;
		}

		//collapse the block if expanded
		if (block.hasClass('expanded')) {
			block.trigger('collapse')
			return;
		}

		//these might not contain any inputs, just expand the block
		if (block.hasClass('inputBlock-type-empty')) {
			block.trigger('expand');
		} else if (!input.is(':focus')) {
			//use plain old expand for inputblocks with .autofocus
			if (!block.hasClass('autofocus')) {
				block.trigger('expand');
			} else {
				//select the input
				//block.trigger('expand');
				input.focus();
			}
		}
	})

	block.on('expand', function() {
		if (options.disabled){
			return
		}
		//$('.modalBody.modalPopupSection')[0].scrollTop = 0;
		var others = block.parent().find('.inputBlock-collapse').filter(function(i, item) {
			return item != block[0];
		});
		others.trigger('collapse');

		var originalTop = $('.modalBody.modalPopupSection').scrollTop();
		$('.modalBody.modalPopupSection').data('original-scroll-top', originalTop);

		//blockContent.css({height: fullHeight});

		setTimeout(function() {

			//scroll the expanded view based on size

			var offset = $('.inputBlock-collapse.expanded').offset();
			if (!offset) {
				// Sometimes offset does not exist, presumably because the element
				// does not exist. In that case, avoid error.
				return;
			}
			var scrollTop = offset.top + $('.modalBody.modalPopupSection').scrollTop() - 50

			var naturalScrollMargin = $('.modalBody.modalPopupSection')[0].scrollHeight - $('.modalBody.modalPopupSection').innerHeight();

			var diff = (block.height() + block.offset().top + $('.modalBody.modalPopupSection').scrollTop()) - $('.modalBody.modalPopupSection').outerHeight();

			//handle block scroll position. Only scroll if the whole block doesn't fit in the current viewport. Mobile devices always scroll to top
			var ENABLE_BLOCK_SCROLL_HANDLING = false;
			if (!ENABLE_BLOCK_SCROLL_HANDLING) {
				return;
			} else if (diff > 0 || touchEnabled) {
				if (naturalScrollMargin > 0) {
					$('.modalBody.modalPopupSection').css('padding-bottom', block.offset().top)
				}

				//bigger than viewport? attach top
				if (block.height() > $('.modalBody.modalPopupSection').innerHeight() || touchEnabled) {
					$('.modalBody.modalPopupSection').data('original-scroll-top', scrollTop)
				} else {
					//smaller than viewport, attach bottom;
					scrollTop = scrollTop - ($('.modalBody.modalPopupSection').outerHeight() - block.height());
					$('.modalBody.modalPopupSection').data('original-scroll-top', scrollTop)
				}
				$('.modalBody.modalPopupSection').animate({
					scrollTop: scrollTop
				}, {
					duration: 250, easing: 'swing', complete: function() {
					}
				})

			}

			if (input && input.focus && !touchEnabled && !input.is(':focus')) {
				input.focus();
			}
		}, 0);

		block.addClass('expanded');
	})

	block.on('collapse', function() {
		if (block.hasClass('expanded')) {
			var fullHeight = blockContent.outerHeight();
			blockContent.css({ height: fullHeight });
			$('.modalBody.modalPopupSection').css({
				paddingBottom: 0
			})
			setTimeout(function() {
				blockContent.css({ height: '' });
				block.removeClass('expanded');
			}, 10)
			if (input) {
				input.blur();
			}
		}
	})
	return block;
}

function createInput(options) {
	var defaultOptions = {
		placeholder: '',
		width: '100%', // default 100%. in small screens width is forced to 100%.
		class: '',
		label: '', // some inputs needs label in input element (checkbox)
		type: 'text', // select option type is: [{ id: "fi", name: "Finland" }, ...]
		value: '',
	};
	options = $.extend(defaultOptions, options);

	if (!inputTypes[options.type])
		alert('type ' + options.type + ' not supported');

	var type = $.extend({}, inputTypes.text, inputTypes[inputTypes[options.type].inherits], inputTypes[options.type]);

	var input = type.create(options).addClass('basicInput basicInput-type-' + options.type);


	var inlinePlaceholder = '';
	if (type === 'amountSpinner'){
		inlinePlaceholder = options.placeholder;
	}

	type.init(input, options);
	var realInput = type.getInputElement(input);
	if (realInput) {
		realInput.attr({
			type: type.type,
			placeholder: inlinePlaceholder
		});
	}
	if (options.class) input.addClass(options.class);
	type.set(input, options.value);
	type.validate(input);
	if (realInput) {
		realInput.change(function() {
			type.validate(input);
		});
	}
	input.data('type', type);
	input.data('get', function() {
		return type.get(input);
	});
	input.data('set', function(val) {
		type.set(input, val);
		if (realInput)
			realInput.change();
	});
	if (realInput) {
		input.data('change', function(listener) {
			realInput.change(listener);
		});
	}

	return input;
}

var inputTypes = {
	text: {
		inherits: 'text', // cannot inherit inherited
		type: 'text',
		create: function() {
			return $('<input>');
		},
		init: function(input) {
		},
		validate: function(input) {
		},
		set: function(input, value) {
			input.val(value);
		},
		get: function(input) {
			return input.val();
		},
		getInputElement: function(rootElement) {
			// if this returns null, you must have your own setter, change-listener and call change on set
			return rootElement;
		}
	},
	username: {},
	email: {
		type: 'email',
		init: function(input) {
			input.attr({
				'name': 'email',
				'autocomplete': 'on'
			});
		}
	},
	password: {
		type: 'password',
	},
	empty: {
		type: 'empty',
		init: function() {

		},
	},
	price: {
		type: 'number',
		set: function(input, value) {
			if (value === null) {
				input.val('');
			} else {
				input.val(isNaN(value) ? '' : (value / 100));
			}
			input.data('oldVal', input.val());
		},
		get: function(input) {
			return Math.round(parseFloat(input.val()) * 100);
		},
		validate: function(input) {
			var val = input.val();
			if (val == '') {
				input.data('oldVal', val);
				return;
			}
			var num = parseFloat(val);
			if (isNaN(num) || num < 0) {
				input.val(input.data('oldVal') || '');
			} else {
				var minPriceFloat = myInfo.country.minPrice / 100;
				if (num != 0 && window.myInfo && myInfo.country && myInfo.country.currency && num < minPriceFloat) {
					num = minPriceFloat;
				}

				input.val(num.toFixed(2));
				input.data('oldVal', input.val());
			}
		},
	},
	location: {
		set: function(input, value) {
			input.val(value);
			input.data('oldVal', input.val());
		},
		validate: function(input) {
			var val = input.val();
			if (val == '') {
				input.data('oldVal', val);
				input.val('');
				return;
			}
			var num = parseFloat(val);
			if (isNaN(num) || num < -180 || num > 180) {
				input.val(input.data('oldVal') || '');
			}
			else {
				input.val(num);
				input.data('oldVal', input.val());
			}
		}
	},
	textarea: {
		create: function() {
			return $('<textarea>');
		},
		init: function(input) {
			input.attr('rows', 6)
			input.css({
				'height': 'auto',
			})
		}

	},
	number: {
		type: 'number',
		get: function(input) {
			return parseFloat(input.val());
		},
	},
	checkbox: {
		type: 'checkbox', // doesn't work because of container
		create: function(options) {
			var container = $('<div>');
			var name = 'checkbox_' + Math.random();
			var input = $('<input>').attr({
				id: name,
			}).appendTo(container);

			var label = $('<label>').text(options.label).attr({
				for: name
			}).appendTo(container);
			if (!options.label) {
				container.css('position', 'relative');
				label.addClass('checkbox-bigEmptyLabelClickArea');
				container.addClass('selectNone');
			}
			return container;
		},
		init: function(input, options) {

		},
		get: function(input) {
			return input.find('input').prop('checked') ? 1 : 0;
		},
		set: function(input, value) {
			input.find('input').prop('checked', value && value != 'false');
		},
		getInputElement: function(rootElement) {
			return rootElement.find('input');
		}
	},
	amount: {
		type: 'tel'
		//validateAmount(input);
	},
	amountStepper: {
		type: 'tel',

		create: function(options){
			var container = $('<div>');

			var focused = false;

			var label = $('<label>').append($('<span>').text(options.label)).appendTo(container);
			label.on('click',function(e){
				e.preventDefault();
				e.stopPropagation();

				if (focused){
					console.warn('input had focus', input)
					//input.blur();
				} else {
					focused = true;
					input.focus();
				}
			})

			var name = 'stepper_' + Math.random();
			var input = $('<input>').attr({
				id: name,
				size: 3,
				placeholder: ''
			}).appendTo(label);

			var placeholder = $('<div>').addClass('placeholder').text(options.placeholder).appendTo(label)

			input.on('focus', function(){
				input.select();
				placeholder.hide();
				input.css('height','auto')
			})
			input.on('blur', function(){
				console.log('blurring', parseInt(input.val()))
				if (input.val() && parseInt(input.val()) > 0){
					input.val(parseInt(input.val()))
				} else {
					console.log('emptying')
					input.trigger('change')
					input.val('')
				}
				setTimeout(function(){
					if (!input.is(':focus')){
						focused = false;
					}
				},250)
			})

			function createButton(options){
				var btn = $('<button>').text(options.title);
				btn.on('touchstart', function(){})
				return btn;
			}
			var stepper = $('<div>').addClass('stepper');
			var addButton = createButton({title: '+'})
			var subtractButton = createButton({title: '-'})

			addButton.click(function(){
				var val = parseInt(input.val() || 0);
				val = val + 1;
				if (val > 0 ){

				} else {
					val = 0;
				}
				input.val(val)
			})
			subtractButton.click(function(){
				var val = parseInt(input.val() || 0);

				if (val > 0 ){
					val = val - 1;
				} else {
					val = 0;
				}
				input.val(val)
			})
			//stepper.append(subtractButton)
			//stepper.append(addButton)

			input.on('keydown', function(e){
				//console.log("keydown",e)
				if (e.key === 'ArrowUp') {
					addButton.trigger('click')
				} else if (e.key === 'ArrowDown') {
					subtractButton.trigger('click')
				} else if (e.key === 'Enter') {
					input.blur();
				} else if (e.key) {
				}
			});

			input.change(function() {
				var val = parseInt(input.val() || 0);

				if (val > 0) {
					placeholder.hide();
					input.css('height','auto')
				} else {
					placeholder.show();
					input.css('height','0')
					input.val('')
//					input.hide();
				}
			});

			stepper.appendTo(container)
			input.trigger('change')
			if (!options.label) {
				container.css('position', 'relative');
			}
			return container;
		},
		getInputElement: function(rootElement){
			return rootElement.find('input')
		},
		get: function(input) {
			return parseInt(input.find('input').val() || 0)
		},
		set: function(input, value) {
			input.find('input').val(parseInt(input) || 0)
		},
	},
	checkbox2: {
		type: 'checkbox', // doesn't work because of container
		create: function(options) {
			var container = $('<div>');

			var label = $('<label>').append($('<span>').text(options.label)).appendTo(container);

			var name = 'checkbox_' + Math.random();
			var input = $('<input>').attr({
				id: name
			}).appendTo(label);
			input.prop('checked', options.value)

			var slider = $('<div>').addClass('checkbox-slider').appendTo(label);
			var sliderKnob = $('<div>').addClass('checkbox-slider-knob').appendTo(slider);

			if (!options.label) {
				container.css('position', 'relative');
				label.addClass('checkbox-bigEmptyLabelClickArea');
				container.addClass('selectNone');
			}
			return container;
		},
		init: function(input, options) {

		},
		get: function(input) {
			return input.find('input').prop('checked') ? 1 : 0;
		},
		set: function(input, value) {
			input.find('input').prop('checked', value && value != 'false');
		},
		getInputElement: function(rootElement) {
			return rootElement.find('input');
		}
	},
	radio: {
		type: 'radio', // doesn't work because of container
		create: function(options) {
			var container = $('<div>').addClass('radioButtonContainer');
			var rnd = '' + Math.random();
			rnd = rnd.substring(3);
			var name = 'radio_' + rnd;

			options.radioElements.forEach(function(e) {
				var div = $('<div>').addClass('radioButtonElement')

				var radioButton = $('<input>').attr({
					type: 'radio',
					name: name,
					id: name + '_' + e.id,
					value: e.id
				}).appendTo(div);

				if (options.radioValue == e.id || e.checked) {
					radioButton.prop('checked', true);
				}

				var label = $('<label>').attr('for', name + '_' + e.id).append(e.label || 'Radio button without label');
				div.append(label)

				container.append(div);
			});

			container.data('change', function(listener) {
				container.find('input:radio[name=' + name + ']').change(listener);
			});

			return container;
		},
		get: function(input) {
			return input.find('input:checked').val();
		},
		set: function(input, value) {
			input.find('input[value="' + value + '"]').prop('checked', true);
			input.find('input:radio').change();
		},
		getInputElement: function(rootElement) {
			return null;
		}
	},
	range: {
		type: 'range',
		init: function(input, options) {
			if (options.rangeOptions) {
				input.attr(options.rangeOptions);
			}

			input.data('inputEvent', function(listener) {
				input.on('input', listener);
			});
		},
	},
	search: {
		inherits: 'text',
		//type: 'text', // Can't use type="search" because of inconsistent implementation in browsers
	},
	time: {
		validate: validateTime,
		get: function(input) {
			if (input.val().length <= 1)
				return null;
			else
				return input.val() + ':00'; // 00:00 -> 00:00:00
		},
		set: function(input, value) {
			if (typeof value == 'string' && value.length > 10)
				value = new Date(value);

			if (value instanceof Date) {
				value = value.toTimeString();
			}

			if (!value)
				value = '';

			input.val(value.substring(0, 5));
		},
	},
	select: {
		create: function(options) {
			return createInputBlockOld('select', null, options.placeholder, 'select', options.value, null, null, options.selectOptions);
		},
		init: function(input, options) {
			// This is a hack that makes this hacky wrapper look good
			input.removeClass('basicInput');
		},
		get: function(input) {
			return input.input.val();
		},
		getInputElement: function(rootElement) {
			return rootElement.input;
		},
	}
};

function createInputBlockOld(name, title, placeholder, type, defaultValue, horizontalAlign, width, optionalOptions) {
	var div = $('<div>').addClass('inputBlock');
	if (title && type != 'checkbox') {
		var inputTitle = createInputLabel(title);
		inputTitle.attr('id', 'inputTitle_' + name);
		div.append(inputTitle);
	}

	var options = optionalOptions || {};
	var tag;
	var wrap = false;
	if (type === 'textarea') {
		tag = '<textarea>';
	} else if (type === 'select') {
		tag = '<select>';
		wrap = true;
	} else {
		tag = '<input>';
	}

	var input = $(tag).attr({
		placeholder: placeholder,
		id: 'input_' + name
	}).addClass('basicInput').val(defaultValue);

	var result;

	if (wrap) {
		var wrapper = $('<div class=inputWrapper>').addClass('inputWrapper-' + type).append(input);
		div.append(wrapper);
	} else {
		div.append(input);
	}
	if (type === 'textarea') {
		setTimeout(function() {
			input.autogrow({ vertical: true, horizontal: false, flickering: false });
		}, 0)

	}

	if (horizontalAlign) {
		div.css({
			float: horizontalAlign,
			width: width,
			display: 'inline-block'
		});
	} else {
		div.css('clear', 'both');
	}

	var getValueFunc = function() {
		return input.val();
	};

	input.change(function() {
		input.attr('changed', true);
		div.attr('changed', true);
		getValueFunc.changed = true;
	});

	if (type == 'text') {
		input.attr('type', 'text');
	} else if (type == 'username') {
		input.attr('type', 'text');
	} else if (type == 'email') {
		input.attr({
			'type': 'email',
			'name': 'email',
			'autocomplete': 'on'
		});
	} else if (type == 'password') {
		input.attr('type', 'password');
	} else if (type == 'location') {
		input.attr('type', 'text');
		validateLocation(input);
	} else if (type == 'textarea') {
		/*
		 input.css({
		 height: "80px"
		 });
		 */
	} else if (type == 'amount') {
		input.attr('type', 'number');
		validateAmount(input);
	} else if (type == 'number') {
		input.attr('type', 'number');
	} else if (type == 'checkbox') {
		input.attr('type', 'checkbox');
		input.css('width', 'auto');
		div.append($('<label>').text(title).attr('for', 'input_' + name).css({
			float: 'right',
			width: 'calc(100% - 25px)'
		})).append($('<div style=\'clear: both\'>'));
		if (defaultValue && defaultValue != 'false')
			input.prop('checked', true);
		getValueFunc = function() {
			return input.prop('checked') ? 1 : 0;
		}
	} else if (type == 'time') {
		div.addClass('timeInputBlock');
		input.attr('type', 'text').addClass('timeInput');
		if (defaultValue) {
			if (typeof defaultValue == 'string' && defaultValue.length > 10)
				defaultValue = new Date(defaultValue);

			if (defaultValue instanceof Date) {
				defaultValue = defaultValue.toTimeString().substr(0, 5);
			}

			input.val(defaultValue.substring(0, 5)); // 00:00:00 -> 00:00
		}
		validateTimeOld(input);
		getValueFunc = function() {
			return input.val() + ':00'; // 00:00 -> 00:00:00
			/*
			 var split = input.val().split(":");
			 return new Date(0, 0, 0, split[0], split[1]).toISOString();
			 */
		};
	} else if (type === 'select') {
		var values = options.values || [];
		var labels = options.labels || values;
		values.forEach(function(value, idx) {
			var label = labels[idx];
			var option = $('<option>').attr('value', value).text(label);
			if (String(value) === String(defaultValue)) {
				option.attr('selected', 'selected');
			}
			input.append(option);
		});
	}

	div.input = input;
	div.getValueFunc = getValueFunc;
	return div;
}

function createTextCheckbox(text, id, callback) {
	var button = $('<span>').text(text).attr('id', id).addClass('textCheckbox').click(function() {
		if (button.attr('disabled')) return;
		button.toggleClass('selected');
		if (callback) {
			callback(button.hasClass('selected'));
		}
	});
	return button;
}

/*
 items = [{text, value}]
 callback = function(value) {}
 */
function createMenu(defaultValue, items, callback) {
	var ul = $('<ul>');

	function addItems(items) {
		items.forEach(function(item) {
			var li = $('<li>').attr({
				value: item.value,
			}).text(item.text);

			if (item.value == defaultValue) {
				li.css({
					fontWeight: 'bold',
				});
			}

			ul.append(li);
		});

		setTimeout(function() {
			ul.menu({
				select: function(event, ui) {
					if (callback)
						callback($(event.currentTarget).attr('value'));
					ul.menu('destroy').remove();
				}
			});
		}, 10);

		return ul;
	}

	if (items) addItems(items);
	ul.addItems = addItems;

	return ul;
}

function addBrowserUpdate() {
	wait.env.then(function(env) {
		//PROVIDER_DEPRECATED_BROWSERS
		if (env && env.BROWSER_UPDATE_OPTIONS) {
			window.$buoop = env.BROWSER_UPDATE_OPTIONS;
			var e = document.createElement('script');
			e.src = '//browser-update.org/update.min.js';
			document.body.appendChild(e);
		}
	})
}

return createInputBlockOld('hehe')
})();

export default result
