document.addEventListener('DOMContentLoaded', function() {

    /***********************************************
	 ** Profile: Add Message Encouraging Students to Use Identifiable Avatars
	 ***********************************************/

	// Url must match this pattern
    if ((window.location.href.match(/\/profile/)) || (window.location.href.match(/\/courses\/\d+\/users\/\d+/))) {
		// Provide custom instructions for the "Select Profile Picture" modal dialog (careful: modal is not initially in DOM; it is created on the fly by Canvas)
		document.querySelectorAll(".profile-link").forEach(element => {
            element.addEventListener("click", () => {
                const observer = new MutationObserver((mutationsList, observer) => {
                    for (const mutation of mutationsList) {
                        if (mutation.type === "childList") {
                            const modalTitle = document.querySelector("#ui-id-1.ui-dialog-title");
                            if (modalTitle) {
                                modalTitle.textContent = "Faculty rely on photos to learn student names. Please consider using a photo that clearly shows your face.";
                                observer.disconnect(); // Stop observing once the modal is found and updated
                                break;
                            }
                        }
                    }
                });
                observer.observe(document.body, { childList: true, subtree: true });
            });
        });
    }

    /***********************************************
	 ** People: Add Face Book and Learning Mode
	 ***********************************************/

	// Url must match this pattern
// Vanilla JS function to shuffle elements
function shuffleElements(parentElement, childSelector) {
    if (!parentElement) return;
    const children = Array.from(parentElement.querySelectorAll(childSelector));
    children.sort(() => Math.random() - 0.5);
    children.forEach(child => parentElement.appendChild(child));
}

// Debounce function
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

	if (window.location.href.match(/\/courses\/\d+\/users/ig)) {
		const setupFaceBookButton = () => {
			const rosterTable = document.querySelector("#content TABLE.roster.ic-Table");
			if (!rosterTable) return; // Should not happen if observer is set up correctly

			if (document.getElementById("wms_roster_btn_learning") === null) {
                // Insert the Learning Mode button and controls
                const controlsHTML = `
                    <div id="wms_roster_controls">
                        <button id="wms_roster_btn_learning" class="btn btn-small" title="(Photos viewable on-campus or via VPN)">
                            <i class="icon-user"></i> Show Face Book
                        </button>&nbsp;&nbsp;
                        <a href="#" id="wms_roster_toggle_names" title=""></a>&nbsp;&nbsp;
                        <span class="hide" id="wms_shuffle_delimiter">|&nbsp;&nbsp;</span>
                        <a href="#" id="wms_roster_shuffle" title=""></a>
                        <br /><br />
                    </div>`;
                rosterTable.insertAdjacentHTML('beforebegin', controlsHTML);

				// Provide custom instructions for the "Add People" modal dialog (careful: modal is not initially in DOM; it is created on the fly by Canvas)
                // GCP-comment: this is not functional */
                /*
                const addUsersButton = document.getElementById("addUsers");
                if (addUsersButton) {
                    addUsersButton.addEventListener("click", function () {
                        const createUsersStep1P = document.querySelector("#create-users-step-1 p");
                        if (createUsersStep1P) {
                            createUsersStep1P.textContent = "Enter Unix names or Williams short email addresses, separated by commas.";
                        }
                        const userListTextarea = document.getElementById("user_list_textarea");
                        if (userListTextarea) {
                            userListTextarea.placeholder = "Examples: pleia, ob1@williams.edu";
                        }
                    });
                }
                */
			}
			// else { // Avoid creating duplicate buttons - this check is now done before calling setupFaceBookButton by the observer logic implicitly
				// return false;
			// } // This else block might be redundant if observer disconnects properly.

			// Toggle: Learning Mode button. Refactored 2024-07-15 to replace deprecated jQuery function toggle() with vanilla JS [gcp1]
			// This part will be handled in a subsequent subtask. For now, ensure it's correctly placed.
			let toggleState = true;
            const learningButton = document.getElementById("wms_roster_btn_learning");
            // Cache other elements that will be manipulated
            const rosterToggleNamesLink = document.getElementById("wms_roster_toggle_names");
            const shuffleDelimiter = document.getElementById("wms_shuffle_delimiter");
            const rosterShuffleLink = document.getElementById("wms_roster_shuffle");
            const originalRosterTable = document.querySelector("#content TABLE.roster.ic-Table"); // Cached from outer scope or re-selected

            // Define the click handler for shuffling
            const handleShuffleClick = (event) => {
                event.preventDefault();
                const grid = document.getElementById("wms_roster_grid");
                if (grid) {
                    shuffleElements(grid, ".wms_roster_user");
                }
            };

            if (learningButton && rosterToggleNamesLink && shuffleDelimiter && rosterShuffleLink && originalRosterTable) { // Ensure all elements exist
                learningButton.addEventListener("click", () => {
                    if (toggleState) {
                        // Turn learning mode: ON
                        learningButton.innerHTML = "<i class=\"icon-user\"></i> Return to List";

                        rosterToggleNamesLink.textContent = "Turn Learning Mode On";
                        rosterToggleNamesLink.setAttribute("title", "Hide names");

                        // This variable will be managed by handleToggleNamesClick
                        let toggleNamesState = true;

                        // Define the click handler for toggling names visibility
                        const handleToggleNamesClick = (event) => {
                            event.preventDefault(); // Prevent default link behavior
                            const rosterUsers = document.querySelectorAll("#wms_roster_grid .wms_roster_user");
                            const allSmallNameElements = document.querySelectorAll("#wms_roster_grid .wms_roster_user small");

                            if (toggleNamesState) { // Currently ON (names shown or hoverable), about to turn OFF (names hidden by default)
                                rosterToggleNamesLink.textContent = "Turn Learning Mode Off";
                                rosterToggleNamesLink.setAttribute("title", "Show names");
                                allSmallNameElements.forEach(small => small.classList.add("hide"));
                                rosterUsers.forEach(user => {
                                    user.onmouseenter = () => user.querySelectorAll("small").forEach(s => s.classList.remove("hide"));
                                    user.onmouseleave = () => user.querySelectorAll("small").forEach(s => s.classList.add("hide"));
                                });
                            } else { // Currently OFF (names hidden), about to turn ON (names shown)
                                rosterToggleNamesLink.textContent = "Turn Learning Mode On";
                                rosterToggleNamesLink.setAttribute("title", "Hide names");
                                allSmallNameElements.forEach(small => small.classList.remove("hide"));
                                rosterUsers.forEach(user => {
                                    // Ensure names stay visible on hover
                                    user.onmouseenter = () => user.querySelectorAll("small").forEach(s => s.classList.remove("hide"));
                                    user.onmouseleave = () => user.querySelectorAll("small").forEach(s => s.classList.remove("hide"));
                                });
                            }
                            toggleNamesState = !toggleNamesState;
                        };

                        // Initial setup for names when learning mode is turned ON: Hide names and set up hover
                        rosterToggleNamesLink.textContent = "Turn Learning Mode Off"; // Initial state is "names hidden"
                        rosterToggleNamesLink.setAttribute("title", "Show names");
                        // Apply initial hide and hover logic directly without waiting for a click
                        document.querySelectorAll("#wms_roster_grid .wms_roster_user small").forEach(small => small.classList.add("hide"));
                        document.querySelectorAll("#wms_roster_grid .wms_roster_user").forEach(user => {
                            user.onmouseenter = () => user.querySelectorAll("small").forEach(s => s.classList.remove("hide"));
                            user.onmouseleave = () => user.querySelectorAll("small").forEach(s => s.classList.add("hide"));
                        });
                        toggleNamesState = true; // Set initial state correctly, next click on link will show names.

                        rosterToggleNamesLink.addEventListener('click', handleToggleNamesClick);
                        // Store a reference to the handler for potential removal, though the logic below handles it.
                        learningButton._handleToggleNamesClick = handleToggleNamesClick;


                        // Create array to copy desired contents
                        let createGrid = "";
                        const extractHTMLObjects = originalRosterTable.querySelectorAll("TBODY TR.rosterUser");
                        extractHTMLObjects.forEach(row => {
                            const imgCell = row.querySelector('td:nth-child(1)');
                            const nameCell = row.querySelector('td:nth-child(2)');
                            const unixIdCell = row.querySelector('td:nth-child(3)');
                            const roleCell = row.querySelector('td:nth-child(6)');

                            if (imgCell && nameCell && unixIdCell && roleCell) {
                                const img = imgCell.innerHTML;
                                const name = nameCell.innerHTML; // Contains name and potential existing small tags
                                const unixId = unixIdCell.textContent ? unixIdCell.textContent.trim() : '';
                                const role = roleCell.textContent ? roleCell.textContent.trim() : '';

                                const user_info = `${img}<small class="">${name}</small><br /><small class="">${role}</small>`;
                                createGrid += `<div class="wms_roster_user">${user_info}</div>`;
                            }
                        });
                        createGrid = `<div id="wms_roster_grid">${createGrid}</div>`;

                        shuffleDelimiter.classList.remove("hide");
                        rosterShuffleLink.textContent = "Shuffle";
                        rosterShuffleLink.setAttribute("title", "Reorder the roster");
                        rosterShuffleLink.addEventListener('click', handleShuffleClick);
                        learningButton._handleShuffleClick = handleShuffleClick; // Store for removal

                        originalRosterTable.insertAdjacentHTML('beforebegin', createGrid);
                        originalRosterTable.classList.add("hide");
                    } else {
                        // Turn learning mode: OFF
                        learningButton.innerHTML = "<i class=\"icon-user\"></i> Show Face Book";
                        learningButton.setAttribute("title", "(Photos viewable on-campus or via VPN)");

                        rosterToggleNamesLink.textContent = "";
                        rosterToggleNamesLink.setAttribute("title", "");
                        // rosterToggleNamesLink.textContent = ""; // Already handled by listener removal logic
                        // rosterToggleNamesLink.setAttribute("title", ""); // Already handled
                        if (learningButton._handleToggleNamesClick) {
                            rosterToggleNamesLink.removeEventListener('click', learningButton._handleToggleNamesClick);
                            delete learningButton._handleToggleNamesClick; // Clean up
                        }
                        // Ensure names are visible and hover effects removed or benign
                        const allSmallNameElementsOff = document.querySelectorAll("#wms_roster_grid .wms_roster_user small");
                        if (allSmallNameElementsOff) {
                            allSmallNameElementsOff.forEach(small => small.classList.remove("hide"));
                        }
                        const rosterUsersOff = document.querySelectorAll("#wms_roster_grid .wms_roster_user");
                        if (rosterUsersOff) {
                            rosterUsersOff.forEach(user => {
                                user.onmouseenter = null; // Remove hover effects
                                user.onmouseleave = null;
                            });
                        }


                        shuffleDelimiter.classList.add("hide");
                        rosterShuffleLink.textContent = "";
                        rosterShuffleLink.setAttribute("title", "");
                        if (learningButton._handleShuffleClick) {
                            rosterShuffleLink.removeEventListener('click', learningButton._handleShuffleClick);
                            delete learningButton._handleShuffleClick; // Clean up
                        }

                        const rosterGrid = document.getElementById("wms_roster_grid");
                        if (rosterGrid) {
                            rosterGrid.remove();
                        }
                        originalRosterTable.classList.remove("hide");
                    }
                    toggleState = !toggleState; // Toggle the state for the next click
                });
            }
		};

		const observer = new MutationObserver((mutationsList, observer) => {
			for (const mutation of mutationsList) {
				if (mutation.type === 'childList') {
					const rosterTable = document.querySelector("#content TABLE.roster.ic-Table");
					if (rosterTable) {
						setupFaceBookButton();
						observer.disconnect(); // Important: disconnect observer after setup
						return; // Exit once table is found and setup is called
					}
				}
			}
		});
		observer.observe(document.body, { childList: true, subtree: true });
	}

	/***********************************************
	 ** Add Presenter View (zoom main div; hide all other columns)
	 ***********************************************/
	/*
	 * START: Scale a page using CSS3
	 * @param minWidth {Number} The width of your wrapper or your page's minimum width.
	 * @return {Void}
	 * author of scalePage fxn: http://binarystash.blogspot.com/2013/04/scaling-entire-page-through-css3.html
	 */

	function scalePage(minWidth) {
		//Check parameters
		if (minWidth === "" || typeof minWidth === 'undefined') { // Added typeof check
			console.log("minWidth not defined. Exiting");
			return;
		}

		//Do not scale if a touch device is detected.
		if (isTouchDevice()) {
			return;
		}

		const parentElem = document.getElementById("wrapper-container");
		if (!parentElem) {
			console.log("#wrapper-container not found. Exiting");
			return;
		}

		//Wrap content to prevent long vertical scrollbars
		const boundaryDiv = document.createElement('div');
		boundaryDiv.id = 'resizer-boundary';

		const superContainerDiv = document.createElement('div');
		superContainerDiv.id = 'resizer-supercontainer';

		// Move existing children of parentElem into superContainerDiv
		while (parentElem.firstChild) {
			superContainerDiv.appendChild(parentElem.firstChild);
		}

		// Assemble the new structure
		boundaryDiv.appendChild(superContainerDiv);
		parentElem.appendChild(boundaryDiv);

		const boundary = boundaryDiv; // Use the created elements
		const superContainer = superContainerDiv;

		//Get current dimensions of content
		let winW = window.innerWidth; // Use innerWidth
		let docH = parentElem.offsetHeight;

		function scalePageNow() {
			//Defining the width of 'supercontainer' ensures that content will be
			//centered when the window is wider than the original content.
			superContainer.style.width = minWidth + "px";

			//Get the width of the window
			winW = window.innerWidth;

			let newWidth = winW / minWidth; //percentage
            // Ensure docH is up-to-date if parentElem's height can change due to other JS or CSS
            docH = parentElem.offsetHeight;
			let newHeight = (docH * (newWidth * minWidth)) / minWidth; //pixel

            const scaleValue = "scale(" + newWidth + ")";
			superContainer.style.transform = scaleValue;
			superContainer.style.transformOrigin = "0 0";
			superContainer.style.msTransform = scaleValue; // IE 9
			superContainer.style.msTransformOrigin = "0 0";
			superContainer.style.MozTransform = scaleValue; // Firefox
			superContainer.style.MozTransformOrigin = "0 0";
			superContainer.style.OTransform = scaleValue; // Opera
			superContainer.style.OTransformOrigin = "0 0";
			superContainer.style.webkitTransform = scaleValue; // Safari and Chrome
			superContainer.style.webkitTransformOrigin = "0 0";

			boundary.style.position = "relative";
			boundary.style.overflow = "hidden";
			boundary.style.height = newHeight + "px";
		}

		scalePageNow(); // Initial call
		window.addEventListener('resize', debounce(scalePageNow, 250));


		function isTouchDevice() {
			return !!('ontouchstart' in window || (window.navigator && window.navigator.msMaxTouchPoints)); // Added check for window.navigator
		}
	}

	// END OF FUNCTION: scalePage()

    //End plugin

	// Url must match this pattern (Do not display "Presenter View" link on pages that display LTI iframes)
	if (!window.location.href.match(/\/external_tools/ig)) {
		const breadcrumbs = document.querySelector("NAV#breadcrumbs");
		if (breadcrumbs) {
			breadcrumbs.insertAdjacentHTML('afterend', '<div id="wms_presenter_breadcrumb"><a href="#" class="btn btn-primary icon-none" title="Enable Presenter View">&nbsp;Presenter&nbsp;View</a></div>');
		}
		const applicationDiv = document.getElementById("application");
		if (applicationDiv) {
			applicationDiv.insertAdjacentHTML('afterbegin', '<div id="wms_presenter_exit_btn"><div id="wms_presenter_exit_text" class="wmsPresenterRotate wmsDisplayNone" title="Exit Presenter View3">Exit&nbsp;Presenter&nbsp;View</div></div>');
		}
	}

	// Exit Presenter View: reload page
	const presenterExitBtn = document.getElementById('wms_presenter_exit_btn');
	if (presenterExitBtn) {
		presenterExitBtn.addEventListener('click', function () {
			location.reload();
		});
	}

	// Enable Presenter View
	const presenterBreadcrumbBtn = document.getElementById('wms_presenter_breadcrumb');
	if (presenterBreadcrumbBtn) {
		presenterBreadcrumbBtn.addEventListener('click', function () {
			document.body.classList.remove("course-menu-expanded");

			if (presenterBreadcrumbBtn) presenterBreadcrumbBtn.classList.add("wmsDisplayNone");

			const header = document.querySelector("HEADER");
			if (header) header.classList.add("wmsDisplayNone");

			const appNavToggle = document.querySelector(".ic-app-nav-toggle-and-crumbs");
			if (appNavToggle) appNavToggle.classList.add("wmsDisplayNone");

			const leftSide = document.getElementById("left-side");
			if (leftSide) leftSide.classList.add("wmsDisplayNone");

			const rightSideWrapper = document.getElementById("right-side-wrapper");
			if (rightSideWrapper) rightSideWrapper.classList.add("wmsDisplayNone");

			const mainContent = document.getElementById("main");
			if (mainContent) {
				mainContent.classList.add("wmsMarginZero");
				mainContent.style.cssText = "padding-left: 25px;max-width: 900px !important;";
			}

			const wrapperContainer = document.getElementById("wrapper-container");
			if (wrapperContainer) wrapperContainer.classList.add("wmsMarginZero");

			const mainLayoutHorizontal = document.querySelector(".ic-app-main-layout-horizontal");
			if (mainLayoutHorizontal) mainLayoutHorizontal.classList.add("wmsMarginZero");

			// force all images to zoom correctly and avoid cutting off images; requires removing the default style: IMG{max-width:1050px}
			// const images = document.querySelectorAll("IMG");
            // images.forEach(img => img.style.maxWidth = "100% !important");


			// do scale function
			scalePage(900); // set somewhat arbitrary hardcoded minWidth value

			// show exit button (on extreme left side)
			const exitBtn = document.getElementById('wms_presenter_exit_btn');
			if (exitBtn) exitBtn.classList.add("wmsPresenterExit");

			const exitBtnText = document.getElementById('wms_presenter_exit_text');
			if (exitBtnText) exitBtnText.classList.remove("wmsDisplayNone");
		});
	}

	/***********************************************
	 ** Customize UI: LOGIN PAGE
	 ***********************************************/
	if (window.location.href.match(/\/login\/ldap/ig) || window.location.href.match(/\/login\/canvas/ig) || window.location.href.match(/\/login/ig)) {
		// change title of page (formerly: Log In to Canvas)
		document.title = 'Glow';

		// change labels/text
		const loginForgotPassword = document.getElementById('login_forgot_password');
		if (loginForgotPassword) {
			loginForgotPassword.textContent = "Forgot password?";
			loginForgotPassword.style.setProperty('display', 'initial', 'important');
			loginForgotPassword.style.setProperty('float', 'right', 'important');
		}

        const canvasLoginLink = document.querySelector('.ic-Login__link');
		if (canvasLoginLink) {
			canvasLoginLink.style.setProperty('display', 'none', 'important');
		}

        document.querySelectorAll('label.ic-Label').forEach(el => el.textContent = "");

		document.querySelectorAll('img.broken-image').forEach(img => img.alt = 'broken image');
		document.querySelectorAll('img.hidden-readable').forEach(img => img.alt = 'broken image');

        const loginButton = document.querySelector('.Button--login');
		if (loginButton) {
			loginButton.style.setProperty('position', 'absolute', 'important');
			loginButton.style.setProperty('right', '190px', 'important');
		}

		// custom footer links (only on login page)
		const loginBody = document.querySelector('div.ic-Login__body');
		if (loginBody) {
			const footerHTML =
				'<p id="wms-login-footer">' +
				'<a href="https://dean.williams.edu/policies/classroom-recordings-and-use-of-class-materials/" target="_blank" title="Williams policy on recording and distribution of course materials">Williams policy on recording and distribution of course materials</a><br />' +
				'<a href="http://oit.williams.edu/itech/glow/" target="_blank" title="Glow Help">Glow Help</a>' +
				'</p>';
			loginBody.insertAdjacentHTML('beforeend', footerHTML);
		}

		// ***********************************************
		// Customize UI: MOBILE LOGIN PAGE
		// ***********************************************
		// Change labels/text
		// const mobileForgotPasswordLink = document.querySelector("#login_form.front.face A.forgot-password");
		// if (mobileForgotPasswordLink) { mobileForgotPasswordLink.textContent = "Forgot password?"; }
	}

	/***********************************************
	 ** Customize UI: SELF ENROLL (ALTERNATE LOGIN PAGE)
	 ***********************************************/
	if (window.location.href.match(/\/enroll/ig)) {
		const initialActionInput = document.querySelector("input[name=initial_action]");
		if (initialActionInput) {
			const prevElem = initialActionInput.previousElementSibling;
			if (prevElem && prevElem.tagName === 'P') {
				prevElem.textContent = "Please enter your Username (without '@williams.edu') and password:";
			}
		}

		const confirmationHeader = document.querySelector("HEADER.ic-Login-confirmation__header");
		if (confirmationHeader) {
			confirmationHeader.style.cssText = "background-color: #333333 !important;";
		}

		const confirmationLogo = document.querySelector("IMG.ic-Login-confirmation__logo");
		if (confirmationLogo) {
			confirmationLogo.src = "https://apps.williams.edu/glow/images/enroll-login.png";
			confirmationLogo.alt = "Williams College - GLOW";
		}
	}

	/***********************************************
	 ** Customize UI: INTERNAL PAGES
	 ***********************************************/
	/*extend existing partial horizontal rule to boundary edges*/
	const navToggleAndCrumbs = document.querySelector("DIV.ic-app-nav-toggle-and-crumbs");
	if (navToggleAndCrumbs) {
		navToggleAndCrumbs.classList.add("wmsBreadCrumbsLine");
	}
	const appFooter = document.querySelector("FOOTER.ic-app-footer");
	if (appFooter) {
		appFooter.classList.add("wmsFooterLine");
	}

	// Navigation: Add 'Signup Sheets' to Account Level
	// const fourthMenuItem = document.querySelector("UL#menu li:nth-child(4)");
	// if (fourthMenuItem) {
	// 	fourthMenuItem.insertAdjacentHTML('afterend', '<li class="menu-item"><a id="wms_signup_sheets_icon" href="/users/1234567/external_tools/170518" class="ic-app-header__menu-list-link"><div class="menu-item-icon-container" aria-hidden="true"><img src="https://apps.williams.edu/glow/images/icon-signup-sheets.png" alt="Signup Sheets" title="Signup Sheets" /></div><div class="menu-item__text">Signup Sheets</div></a></li>');
	// }

	// Navigation to add 'Williams Resources' to the account level
    // After installing the LTI, correct the tool link based on the user menu
    const fifthMenuItem = document.querySelector("UL#menu li:nth-child(5)");
	if (fifthMenuItem) {
		fifthMenuItem.insertAdjacentHTML('afterend', '<li class="menu-item"><a id="wms_resources_icon" href="/users/1234567/external_tools/481471" class="ic-app-header__menu-list-link"><div class="menu-item-icon-container" aria-hidden="true"><img src="https://apps.williams.edu/glow/images/icon-williams-resources.png" alt="Williams Resources" title="Williams Resources" /></div><div class="menu-item__text">Resources</div></a></li>');
	}

	/***********************************************
	 ** Footer/Branding Link Overrides
	 ***********************************************/
	/* GCP-comment: doesn't seem to be in effect (no visible footer in Internal Pages)
    // if (!window.location.href.match(/\/login\/ldap/ig) && !window.location.href.match(/\/enroll/ig) && !window.location.href.match(/\/login\/canvas/ig)) {
	//   const mainFooter = document.querySelector("footer"); // Assuming 'footer' is specific enough or use a more specific selector if available
	//   if (mainFooter) {
	// 	mainFooter.insertAdjacentHTML('beforeend', '<div class="ic-app-footer__links"><a href="https://dean.williams.edu/policies/classroom-recordings-and-use-of-class-materials/" title="Williams policy on recording and distribution of course materials" target="_blank">Williams policy on recording and distribution of course materials</a></div>');
	//   }
	// }
	*/

	/***********************************************
	 ** Add Google Analytics
	 ***********************************************/
	 (function (i, s, o, g, r, a, m) {
		 i['GoogleAnalyticsObject'] = r;
		 i[r] = i[r] || function () {
		 (i[r].q = i[r].q || []).push(arguments)
		 }, i[r].l = 1 * new Date();
		 a = s.createElement(o),
		 m = s.getElementsByTagName(o)[0];
		 a.async = 1;
		 a.src = g;
		 m.parentNode.insertBefore(a, m)
	 })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
	 ga('create', 'UA-10912569-3', 'auto');
	 ga('send', 'pageview');
    //fixGlobalNavURL();
    //var Get_Name = ENV.current_user;
    //console.log(Get_Name); // For testing purpose

}); // END OF: document.addEventListener('DOMContentLoaded'