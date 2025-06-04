document.addEventListener('DOMContentLoaded', function() {

    /***********************************************
     ** Profile: Add Message Encouraging Students to Use Identifiable Avatars
     ***********************************************/

    // Url must match this pattern
    if ((window.location.href.match(/\/profile/)) || (window.location.href.match(/\/courses\/\d+\/users\/\d+/))) {
        // Provide custom instructions for the "Select Profile Picture" modal dialog.
        // This modal is not initially in DOM; it is created on the fly by Canvas.
        // We use a MutationObserver to detect when it's added to the DOM.
        document.querySelectorAll(".profile-link").forEach(element => {
            element.addEventListener("click", () => {
                // Options for the observer (which mutations to observe)
                const observerOptions = {
                    childList: true, // Observe direct children additions/removals
                    subtree: true    // Observe all descendants, not just direct children
                };

                // Callback function to execute when mutations are observed
                const callback = function(mutationsList, observerInstance) {
                    for (const mutation of mutationsList) {
                        if (mutation.type === "childList") {
                            const modalTitle = document.querySelector("#ui-id-1.ui-dialog-title");
                            if (modalTitle) {
                                modalTitle.textContent = "Faculty rely on photos to learn student names. Please consider using a photo that clearly shows your face.";
                                observerInstance.disconnect(); // Stop observing once the modal is found and updated
                                break;
                            }
                        }
                    }
                };

                // Create an observer instance linked to the callback function
                const profileModalObserver = new MutationObserver(callback);

                // Start observing the target node for configured mutations
                profileModalObserver.observe(document.body, observerOptions);
            });
        });
    }


    /***********************************************
     ** People: Add Face Book and Learning Mode
     ***********************************************/

    // Vanilla JS function to shuffle elements within a parent
function shuffleElements(parentElement, childSelector) {
    if (!parentElement) return;
    const children = Array.from(parentElement.querySelectorAll(childSelector)); // Get NodeList as Array
    children.sort(() => Math.random() - 0.5); // Shuffle the array
    children.forEach(child => parentElement.appendChild(child)); // Re-append children in new order
}

// Debounce function to limit the rate at which a function can fire.
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

    // Url must match the People page pattern
	if (window.location.href.match(/\/courses\/\d+\/users/ig)) {

        // Sets up the Face Book button and its associated functionalities.
        const setupFaceBookButton = () => {
			const rosterTable = document.querySelector("#content TABLE.roster.ic-Table");
			if (!rosterTable) {
                // Roster table not found, cannot proceed with setup.
                return;
            }

            // Check if the Learning Mode button already exists to prevent duplication.
			if (document.getElementById("wms_roster_btn_learning") === null) {
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

				// Commented out: Custom instructions for the "Add People" modal dialog.
                // This functionality was marked as not functional.
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
			// Note: The 'else' block for avoiding duplicate buttons is implicitly handled
            // by the `getElementById("wms_roster_btn_learning") === null` check.

			// --- Learning Mode Button Logic ---
			let toggleState = true; // true = Learning Mode ON, false = Learning Mode OFF
            const learningButton = document.getElementById("wms_roster_btn_learning");

            // Cache DOM elements for the learning mode controls
            const rosterToggleNamesLink = document.getElementById("wms_roster_toggle_names");
            const shuffleDelimiter = document.getElementById("wms_shuffle_delimiter");
            const rosterShuffleLink = document.getElementById("wms_roster_shuffle");
            const originalRosterTable = document.querySelector("#content TABLE.roster.ic-Table");

            // Click handler for the main "Shuffle" link
            const handleShuffleClick = (event) => {
                event.preventDefault();
                const grid = document.getElementById("wms_roster_grid");
                if (grid) {
                    shuffleElements(grid, ".wms_roster_user");
                }
            };

            // Ensure all necessary elements are present before adding event listeners
            if (learningButton && rosterToggleNamesLink && shuffleDelimiter && rosterShuffleLink && originalRosterTable) {

                learningButton.addEventListener("click", () => {
                    if (toggleState) {
                        // ---- Turn Learning Mode ON ----
                        learningButton.innerHTML = "<i class=\"icon-user\"></i> Return to List";

                        rosterToggleNamesLink.textContent = "Turn Learning Mode On";
                        rosterToggleNamesLink.setAttribute("title", "Hide names");

                        let toggleNamesState = true; // true = Names hidden by default, false = Names shown

                        // Click handler for the "Toggle Names" link
                        // This handler is added/removed when learning mode is toggled
                        const handleToggleNamesClick = (event) => {
                            event.preventDefault();
                            const rosterUsers = document.querySelectorAll("#wms_roster_grid .wms_roster_user");
                            const allSmallNameElements = document.querySelectorAll("#wms_roster_grid .wms_roster_user small");

                            if (toggleNamesState) {
                                // Change to: Names visible by default
                                rosterToggleNamesLink.textContent = "Turn Learning Mode On";
                                rosterToggleNamesLink.setAttribute("title", "Hide names");
                                allSmallNameElements.forEach(small => small.classList.remove("hide"));
                                rosterUsers.forEach(user => {
                                    user.onmouseenter = () => user.querySelectorAll("small").forEach(s => s.classList.remove("hide"));
                                    user.onmouseleave = () => user.querySelectorAll("small").forEach(s => s.classList.remove("hide"));
                                });
                            } else {
                                // Change to: Names hidden by default (hover to show)
                                rosterToggleNamesLink.textContent = "Turn Learning Mode Off";
                                rosterToggleNamesLink.setAttribute("title", "Show names");
                                allSmallNameElements.forEach(small => small.classList.add("hide"));
                                rosterUsers.forEach(user => {
                                    user.onmouseenter = () => user.querySelectorAll("small").forEach(s => s.classList.remove("hide"));
                                    user.onmouseleave = () => user.querySelectorAll("small").forEach(s => s.classList.add("hide"));
                                });
                            }
                            toggleNamesState = !toggleNamesState;
                        };

                        // Initial setup for "Toggle Names" link when learning mode is first activated:
                        // Names are hidden by default, hover reveals them.
                        rosterToggleNamesLink.textContent = "Turn Learning Mode Off";
                        rosterToggleNamesLink.setAttribute("title", "Show names");

                        // The roster grid is created here, so we apply initial hide and hover after its creation.
                        // (Code for creating 'createGrid' follows)

                        // Attach the "Toggle Names" click handler
                        rosterToggleNamesLink.addEventListener('click', handleToggleNamesClick);
                        learningButton._handleToggleNamesClick = handleToggleNamesClick; // Store for removal

                        // ---- Roster Grid Creation ----
                        let createGrid = "";
                        const extractHTMLObjects = originalRosterTable.querySelectorAll("TBODY TR.rosterUser");
                        extractHTMLObjects.forEach(row => {
                            const imgCell = row.querySelector('td:nth-child(1)');
                            const nameCell = row.querySelector('td:nth-child(2)');
                            const unixIdCell = row.querySelector('td:nth-child(3)');
                            const roleCell = row.querySelector('td:nth-child(6)');

                            if (imgCell && nameCell && unixIdCell && roleCell) {
                                const img = imgCell.innerHTML;
                                const name = nameCell.innerHTML;
                                const unixId = unixIdCell.textContent ? unixIdCell.textContent.trim() : '';
                                const role = roleCell.textContent ? roleCell.textContent.trim() : '';

                                const user_info = `${img}<small class="">${name}</small><br /><small class="">${role}</small>`;
                                createGrid += `<div class="wms_roster_user">${user_info}</div>`;
                            }
                        });
                        createGrid = `<div id="wms_roster_grid">${createGrid}</div>`;

                        originalRosterTable.insertAdjacentHTML('beforebegin', createGrid);

                        // After grid is created, apply initial name visibility and hover effects
                        document.querySelectorAll("#wms_roster_grid .wms_roster_user small").forEach(small => small.classList.add("hide"));
                        document.querySelectorAll("#wms_roster_grid .wms_roster_user").forEach(user => {
                            user.onmouseenter = () => user.querySelectorAll("small").forEach(s => s.classList.remove("hide"));
                            user.onmouseleave = () => user.querySelectorAll("small").forEach(s => s.classList.add("hide"));
                        });
                        toggleNamesState = true; // Reflects that names are initially hidden

                        // ---- Shuffle Controls ----
                        shuffleDelimiter.classList.remove("hide");
                        rosterShuffleLink.textContent = "Shuffle";
                        rosterShuffleLink.setAttribute("title", "Reorder the roster");
                        rosterShuffleLink.addEventListener('click', handleShuffleClick);
                        learningButton._handleShuffleClick = handleShuffleClick; // Store for removal

                        originalRosterTable.classList.add("hide");
                    } else {
                        // ---- Turn Learning Mode OFF ----
                        learningButton.innerHTML = "<i class=\"icon-user\"></i> Show Face Book";
                        learningButton.setAttribute("title", "(Photos viewable on-campus or via VPN)");

                        // Clear and remove "Toggle Names" functionality
                        rosterToggleNamesLink.textContent = "";
                        rosterToggleNamesLink.setAttribute("title", "");
                        if (learningButton._handleToggleNamesClick) {
                            rosterToggleNamesLink.removeEventListener('click', learningButton._handleToggleNamesClick);
                            delete learningButton._handleToggleNamesClick;
                        }

                        // Remove hover effects from any (now removed) grid items
                        // This is more of a cleanup for the onmouseenter/onmouseleave properties if they were on persistent elements.
                        // Since #wms_roster_grid is removed, its children's listeners are also gone.
                        // However, if elements were outside the grid and affected, this would be relevant.
                        // For this specific code, direct removal of the grid handles it.

                        // Clear and remove "Shuffle" functionality
                        shuffleDelimiter.classList.add("hide");
                        rosterShuffleLink.textContent = "";
                        rosterShuffleLink.setAttribute("title", "");
                        if (learningButton._handleShuffleClick) {
                            rosterShuffleLink.removeEventListener('click', learningButton._handleShuffleClick);
                            delete learningButton._handleShuffleClick;
                        }

                        // Remove the roster grid and show the original table
                        const rosterGrid = document.getElementById("wms_roster_grid");
                        if (rosterGrid) {
                            rosterGrid.remove();
                        }
                        originalRosterTable.classList.remove("hide");
                    }
                    toggleState = !toggleState;
                });
            }
		}; // End of setupFaceBookButton

        // MutationObserver to detect when the roster table is added to the DOM
        // (e.g., after an AJAX call completes on the People page)
		const rosterObserverOptions = {
            childList: true,
            subtree: true
        };

        const rosterCallback = function(mutationsList, observerInstance) {
			for (const mutation of mutationsList) {
				if (mutation.type === 'childList') {
					const rosterTable = document.querySelector("#content TABLE.roster.ic-Table");
					if (rosterTable) {
						setupFaceBookButton(); // Setup Face Book button once table is available
						observerInstance.disconnect(); // Stop observing once setup is done
						return;
					}
				}
			}
		};

        const rosterPageObserver = new MutationObserver(rosterCallback);
		rosterPageObserver.observe(document.body, rosterObserverOptions);
	}


	/***********************************************
     ** Add Presenter View (zoom main div; hide all other columns)
     ***********************************************/

    /*
	 * START: Scale a page using CSS3
	 * @param minWidth {Number} The width of your wrapper or your page's minimum width.
	 * @return {Void}
	 * Original author of scalePage function: http://binarystash.blogspot.com/2013/04/scaling-entire-page-through-css3.html
	 */
	function scalePage(minWidth) {
		// Check parameters
		if (minWidth === "" || typeof minWidth === 'undefined') {
			console.log("scalePage: minWidth not defined. Exiting");
			return;
		}

		// Do not scale if a touch device is detected.
		if (isTouchDevice()) {
			return;
		}

		const parentElem = document.getElementById("wrapper-container");
		if (!parentElem) {
			console.log("scalePage: #wrapper-container not found. Exiting");
			return;
		}

		// Create wrapper divs to enable content scaling
        // without affecting layout of parentElem's siblings.
		const boundaryDiv = document.createElement('div');
		boundaryDiv.id = 'resizer-boundary';

		const superContainerDiv = document.createElement('div');
		superContainerDiv.id = 'resizer-supercontainer';

		// Move existing children of parentElem into superContainerDiv
		while (parentElem.firstChild) {
			superContainerDiv.appendChild(parentElem.firstChild);
		}

		// Assemble the new structure: parentElem -> boundaryDiv -> superContainerDiv -> (original children)
		boundaryDiv.appendChild(superContainerDiv);
		parentElem.appendChild(boundaryDiv);

		const boundary = boundaryDiv;
		const superContainer = superContainerDiv;

		let winW = window.innerWidth;
		let docH = parentElem.offsetHeight; // Get initial height

        // Nested function to perform the actual scaling
		function scalePageNow() {
			superContainer.style.width = minWidth + "px";

			winW = window.innerWidth;
            docH = parentElem.offsetHeight; // Re-check height in case it changed

			let newWidth = winW / minWidth;
			let newHeight = (docH * (newWidth * minWidth)) / minWidth;

            const scaleValue = "scale(" + newWidth + ")";
			superContainer.style.transform = scaleValue;
			superContainer.style.transformOrigin = "0 0";
			superContainer.style.msTransform = scaleValue;
			superContainer.style.msTransformOrigin = "0 0";
			superContainer.style.MozTransform = scaleValue;
			superContainer.style.MozTransformOrigin = "0 0";
			superContainer.style.OTransform = scaleValue;
			superContainer.style.OTransformOrigin = "0 0";
			superContainer.style.webkitTransform = scaleValue;
			superContainer.style.webkitTransformOrigin = "0 0";

			boundary.style.position = "relative";
			boundary.style.overflow = "hidden";
			boundary.style.height = newHeight + "px";
		}

		scalePageNow(); // Apply scaling immediately
        // Add debounced resize listener to re-apply scaling on window resize
		window.addEventListener('resize', debounce(scalePageNow, 250));

        // Helper function to detect touch devices
		function isTouchDevice() {
			return !!('ontouchstart' in window || (window.navigator && window.navigator.msMaxTouchPoints));
		}
	} // END OF FUNCTION: scalePage()


	// Add Presenter View buttons if not on an external tool page
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

	// Event listener for exiting Presenter View
	const presenterExitBtn = document.getElementById('wms_presenter_exit_btn');
	if (presenterExitBtn) {
		presenterExitBtn.addEventListener('click', function () {
			location.reload(); // Simple page reload to exit
		});
	}

	// Event listener for enabling Presenter View
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

			// Commented out: Force image zoom behavior
			// const images = document.querySelectorAll("IMG");
            // images.forEach(img => img.style.maxWidth = "100% !important");

			scalePage(900); // Activate page scaling

			// Show the exit button for Presenter View
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
		document.title = 'Glow'; // Change page title

		// Modify "Forgot password?" link
		const loginForgotPassword = document.getElementById('login_forgot_password');
		if (loginForgotPassword) {
			loginForgotPassword.textContent = "Forgot password?";
			loginForgotPassword.style.setProperty('display', 'initial', 'important');
			loginForgotPassword.style.setProperty('float', 'right', 'important');
		}

        // Hide the default Canvas login link if it exists
        const canvasLoginLink = document.querySelector('.ic-Login__link');
		if (canvasLoginLink) {
			canvasLoginLink.style.setProperty('display', 'none', 'important');
		}

        // Clear text from general labels (if any)
        document.querySelectorAll('label.ic-Label').forEach(el => el.textContent = "");

        // Set alt text for potentially broken images
		document.querySelectorAll('img.broken-image').forEach(img => img.alt = 'broken image');
		document.querySelectorAll('img.hidden-readable').forEach(img => img.alt = 'broken image');

        // Adjust login button style
        const loginButton = document.querySelector('.Button--login');
		if (loginButton) {
			loginButton.style.setProperty('position', 'absolute', 'important');
			loginButton.style.setProperty('right', '190px', 'important');
		}

		// Add custom footer links to the login page
		const loginBody = document.querySelector('div.ic-Login__body');
		if (loginBody) {
			const footerHTML =
				'<p id="wms-login-footer">' +
				'<a href="https://dean.williams.edu/policies/classroom-recordings-and-use-of-class-materials/" target="_blank" title="Williams policy on recording and distribution of course materials">Williams policy on recording and distribution of course materials</a><br />' +
				'<a href="http://oit.williams.edu/itech/glow/" target="_blank" title="Glow Help">Glow Help</a>' +
				'</p>';
			loginBody.insertAdjacentHTML('beforeend', footerHTML);
		}

		// Commented out: Mobile Login Page Customization
		// const mobileForgotPasswordLink = document.querySelector("#login_form.front.face A.forgot-password");
		// if (mobileForgotPasswordLink) { mobileForgotPasswordLink.textContent = "Forgot password?"; }
	}


	/***********************************************
     ** Customize UI: SELF ENROLL (ALTERNATE LOGIN PAGE)
     ***********************************************/
	if (window.location.href.match(/\/enroll/ig)) {
        // Change text of the paragraph preceding the initial action input
		const initialActionInput = document.querySelector("input[name=initial_action]");
		if (initialActionInput) {
			const prevElem = initialActionInput.previousElementSibling;
			if (prevElem && prevElem.tagName === 'P') {
				prevElem.textContent = "Please enter your Username (without '@williams.edu') and password:";
			}
		}

        // Style the confirmation header
		const confirmationHeader = document.querySelector("HEADER.ic-Login-confirmation__header");
		if (confirmationHeader) {
			confirmationHeader.style.cssText = "background-color: #333333 !important;";
		}

        // Update the confirmation logo
		const confirmationLogo = document.querySelector("IMG.ic-Login-confirmation__logo");
		if (confirmationLogo) {
			confirmationLogo.src = "https://apps.williams.edu/glow/images/enroll-login.png";
			confirmationLogo.alt = "Williams College - GLOW";
		}
	}


	/***********************************************
     ** Customize UI: INTERNAL PAGES
     ***********************************************/

    // Extend existing partial horizontal rule to boundary edges
	const navToggleAndCrumbs = document.querySelector("DIV.ic-app-nav-toggle-and-crumbs");
	if (navToggleAndCrumbs) {
		navToggleAndCrumbs.classList.add("wmsBreadCrumbsLine");
	}
	const appFooter = document.querySelector("FOOTER.ic-app-footer");
	if (appFooter) {
		appFooter.classList.add("wmsFooterLine");
	}

	// Commented out: Navigation item for 'Signup Sheets'
	// const fourthMenuItem = document.querySelector("UL#menu li:nth-child(4)");
	// if (fourthMenuItem) {
	// 	fourthMenuItem.insertAdjacentHTML('afterend', '<li class="menu-item"><a id="wms_signup_sheets_icon" href="/users/1234567/external_tools/170518" class="ic-app-header__menu-list-link"><div class="menu-item-icon-container" aria-hidden="true"><img src="https://apps.williams.edu/glow/images/icon-signup-sheets.png" alt="Signup Sheets" title="Signup Sheets" /></div><div class="menu-item__text">Signup Sheets</div></a></li>');
	// }

	// Navigation to add 'Williams Resources' to the account level
    // Note: Tool link should be verified after LTI installation.
    const fifthMenuItem = document.querySelector("UL#menu li:nth-child(5)");
	if (fifthMenuItem) {
		fifthMenuItem.insertAdjacentHTML('afterend', '<li class="menu-item"><a id="wms_resources_icon" href="/users/1234567/external_tools/481471" class="ic-app-header__menu-list-link"><div class="menu-item-icon-container" aria-hidden="true"><img src="https://apps.williams.edu/glow/images/icon-williams-resources.png" alt="Williams Resources" title="Williams Resources" /></div><div class="menu-item__text">Resources</div></a></li>');
	}


	/***********************************************
     ** Footer/Branding Link Overrides (Commented Out)
     ***********************************************/
	// This functionality was marked as not visibly in effect on internal pages.
    /*
    // if (!window.location.href.match(/\/login\/ldap/ig) && !window.location.href.match(/\/enroll/ig) && !window.location.href.match(/\/login\/canvas/ig)) {
	//   const mainFooter = document.querySelector("footer");
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
		    (i[r].q = i[r].q || []).push(arguments);
		 }, i[r].l = 1 * new Date();
		 a = s.createElement(o),
		 m = s.getElementsByTagName(o)[0];
		 a.async = 1;
		 a.src = g;
		 m.parentNode.insertBefore(a, m);
	 })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

     ga('create', 'UA-10912569-3', 'auto');
	 ga('send', 'pageview');

    // Commented out: fixGlobalNavURL();
    // Commented out: Test code for ENV.current_user
    // var Get_Name = ENV.current_user;
    // console.log(Get_Name);

}); // END OF: document.addEventListener('DOMContentLoaded'