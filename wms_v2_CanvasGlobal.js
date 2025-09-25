/**
 * Glow Modern JavaScript - Modernized Canvas LMS Enhancement Suite
 *
 * OVERVIEW:
 * This script enhances the Williams College Canvas LMS (Glow) interface with
 * modern vanilla JavaScript, replacing legacy jQuery dependencies.
 *
 * FEATURES:
 * - Profile avatar encouragement system
 * - Enhanced Face Book view with integrated section filtering
 * - Learning mode with name toggle and hover effects
 * - Student roster shuffling functionality
 * - Presenter view with page scaling
 * - Login page customizations
 * - Navigation enhancements
 * - Google Analytics integration
 *
 * SECTION FILTERING:
 * The Face Book tool now includes built-in section filtering controls that appear
 * automatically when Face Book view is activated. Users can:
 * - Navigate through sections with Previous/Next buttons
 * - Show all students with the "Show All" button
 * - View student count for each section
 * - Section names are consistently formatted to exactly 25 characters
 * - Long section names are truncated with ellipsis (22 chars + "...")
 * - Short section names are padded with spaces for consistent alignment
 * - Filter works seamlessly with learning mode and shuffle features
 *
 * MODERNIZATION:
 * - Converted from jQuery to vanilla JavaScript
 * - ES6+ syntax (const/let, arrow functions, template literals)
 * - Modern DOM APIs (querySelector, addEventListener, fetch)
 * - Improved error handling and performance
 * - MutationObserver for AJAX monitoring
 * - Modular, maintainable code structure
 *
 * COMPATIBILITY:
 * - Modern browsers (Chrome 60+, Firefox 55+, Safari 10.1+, Edge 15+)
 * - Canvas LMS interface
 * - No external dependencies
 *
 * AUTHORS: Original jQuery version (David Keiser-Clark | dwk2) + Modern vanilla JS conversion (Gerol Petruzella | gcp1 with Claude Code)
 * VERSION: 2.1.0 - Enhanced Section Filtering with Fixed-Width Display
 */

// Wait for DOM content to be fully loaded (replaces $(document).ready())
document.addEventListener('DOMContentLoaded', () => {

    /***********************************************
     ** Profile: Add Message Encouraging Students to Use Identifiable Avatars
     ***********************************************/

    // URL must match this pattern
    if (window.location.href.match(/\/profile/) || window.location.href.match(/\/courses\/\d+\/users\/\d+/)) {
        // Provide custom instructions for the "Select Profile Picture" modal dialog
        const profileLinks = document.querySelectorAll('.profile-link');
        profileLinks.forEach(link => {
            link.addEventListener('click', () => {
                setTimeout(() => {
                    const dialogTitle = document.querySelector('#ui-id-1.ui-dialog-title');
                    if (dialogTitle) {
                        dialogTitle.textContent = "Faculty rely on photos to learn student names. Please consider using a photo that clearly shows your face.";
                    }
                }, 50);
            });
        });
    }

    /***********************************************
     ** People: Add Face Book and Learning Mode
     ***********************************************/

    // URL must match this pattern
    if (window.location.href.match(/\/courses\/\d+\/users/i)) {

        // Modern AJAX completion listener using fetch API and MutationObserver
        const observeAjaxCompletion = () => {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        initializeFaceBookFeature();
                    }
                });
            });

            const targetNode = document.querySelector('#content');
            if (targetNode) {
                observer.observe(targetNode, { childList: true, subtree: true });
            }

            // Also check if table already exists
            setTimeout(() => initializeFaceBookFeature(), 100);
        };

        const initializeFaceBookFeature = () => {
            const existingButton = document.querySelector('#wms_roster_btn_learning');
            const rosterTable = document.querySelector('#content TABLE.roster.ic-Table');

            if (existingButton || !rosterTable) {
                return;
            }

            try {
                // Insert the Learning Mode button
                const controlsDiv = document.createElement('div');
                controlsDiv.id = 'wms_roster_controls';
                controlsDiv.innerHTML = `
                    <button id="wms_roster_btn_learning" class="btn btn-small" title="(Photos viewable on-campus or via VPN)">
                        <i class="icon-user"></i> Show Face Book
                    </button>&nbsp;&nbsp;
                    <a href="#" id="wms_roster_toggle_names" title=""></a>&nbsp;&nbsp;
                    <span class="hide" id="wms_shuffle_delimiter">|&nbsp;&nbsp;</span>
                    <a href="#" id="wms_roster_shuffle" title=""></a>
                    <br /><br />
                `;

                rosterTable.parentNode.insertBefore(controlsDiv, rosterTable);

                // Initialize learning mode functionality
                initializeLearningMode();

            } catch (error) {
                console.error('Error initializing Face Book feature:', error);
            }
        };

        const initializeLearningMode = () => {
            let toggleState = true;
            const learningButton = document.querySelector('#wms_roster_btn_learning');

            if (!learningButton) return;

            learningButton.addEventListener('click', () => {
                try {
                    if (toggleState) {
                        turnLearningModeOn();
                    } else {
                        turnLearningModeOff();
                    }
                    toggleState = !toggleState;
                } catch (error) {
                    console.error('Error toggling learning mode:', error);
                }
            });
        };

        const turnLearningModeOn = () => {
            const learningButton = document.querySelector('#wms_roster_btn_learning');
            const toggleNamesLink = document.querySelector('#wms_roster_toggle_names');
            const shuffleDelimiter = document.querySelector('#wms_shuffle_delimiter');
            const shuffleLink = document.querySelector('#wms_roster_shuffle');
            const rosterTable = document.querySelector('#content TABLE.roster.ic-Table');

            if (!learningButton || !rosterTable) return;

            // Update button text
            learningButton.innerHTML = '<i class="icon-user"></i> Return to List';

            // Initialize toggle names link
            if (toggleNamesLink) {
                toggleNamesLink.textContent = 'Turn Learning Mode On';
                toggleNamesLink.title = 'Hide names';

                // Setup names toggle functionality
                let toggleNames = true;
                toggleNamesLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    try {
                        if (toggleNames) {
                            hideNamesMode(toggleNamesLink);
                        } else {
                            showNamesMode(toggleNamesLink);
                        }
                        toggleNames = !toggleNames;
                    } catch (error) {
                        console.error('Error toggling names:', error);
                    }
                });
            }

            // Create and display the grid
            const gridHTML = createRosterGrid();
            if (gridHTML) {
                rosterTable.insertAdjacentHTML('beforebegin', gridHTML);

                // Initialize section filtering controls
                initializeSectionFiltering();

                // Setup shuffle functionality
                if (shuffleDelimiter) shuffleDelimiter.classList.remove('hide');
                if (shuffleLink) {
                    shuffleLink.textContent = 'Shuffle';
                    shuffleLink.title = 'Reorder the roster';
                    shuffleLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        shuffleRosterGrid();
                    });
                }

                // Hide original table
                rosterTable.classList.add('hide');
            }
        };

        const turnLearningModeOff = () => {
            const learningButton = document.querySelector('#wms_roster_btn_learning');
            const toggleNamesLink = document.querySelector('#wms_roster_toggle_names');
            const shuffleDelimiter = document.querySelector('#wms_shuffle_delimiter');
            const shuffleLink = document.querySelector('#wms_roster_shuffle');
            const rosterGrid = document.querySelector('#wms_roster_grid');
            const rosterTable = document.querySelector('#content TABLE.roster.ic-Table');

            if (learningButton) {
                learningButton.innerHTML = '<i class="icon-user"></i> Show Face Book';
                learningButton.title = '(Photos viewable on-campus or via VPN)';
            }

            if (toggleNamesLink) {
                toggleNamesLink.textContent = '';
                toggleNamesLink.title = '';
            }

            if (shuffleDelimiter) shuffleDelimiter.classList.add('hide');
            if (shuffleLink) {
                shuffleLink.textContent = '';
                shuffleLink.title = '';
            }

            // Remove section filtering controls
            const sectionControls = document.querySelector('#wms_section_controls');
            if (sectionControls) sectionControls.remove();

            if (rosterGrid) rosterGrid.remove();
            if (rosterTable) rosterTable.classList.remove('hide');
        };

        const hideNamesMode = (toggleLink) => {
            toggleLink.textContent = 'Turn Learning Mode Off';
            toggleLink.title = 'Show names';

            const smallElements = document.querySelectorAll('.wms_roster_user small');
            smallElements.forEach(el => el.classList.add('hide'));

            // Add hover functionality
            const rosterUsers = document.querySelectorAll('#wms_roster_grid .wms_roster_user');
            rosterUsers.forEach(user => {
                const mouseEnterHandler = () => {
                    const smallElements = user.querySelectorAll('small');
                    smallElements.forEach(el => el.classList.remove('hide'));
                };

                const mouseLeaveHandler = () => {
                    const smallElements = user.querySelectorAll('small');
                    smallElements.forEach(el => el.classList.add('hide'));
                };

                user.addEventListener('mouseenter', mouseEnterHandler);
                user.addEventListener('mouseleave', mouseLeaveHandler);
            });
        };

        const showNamesMode = (toggleLink) => {
            toggleLink.textContent = 'Turn Learning Mode On';
            toggleLink.title = 'Hide names';

            const smallElements = document.querySelectorAll('.wms_roster_user small');
            smallElements.forEach(el => el.classList.remove('hide'));
        };

        const createRosterGrid = () => {
            const rosterRows = document.querySelectorAll('#content TABLE.roster.ic-Table TBODY TR.rosterUser');
            if (rosterRows.length === 0) return null;

            let gridHTML = '';

            rosterRows.forEach(row => {
                try {
                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 6) {
                        const img = cells[0]?.innerHTML || '';
                        const name = cells[1]?.innerHTML || '';
                        const unixId = cells[2]?.textContent?.trim() || '';
                        const role = cells[5]?.textContent || '';

                        // Extract section information for filtering
                        const sectionDiv = row.querySelector('div.section');
                        const section = sectionDiv ? sectionDiv.textContent.trim() : 'No Section';

                        const userInfo = `${img}<small class="">${name}</small><br /><small class="">${role}</small>`;
                        gridHTML += `<div class="wms_roster_user" data-section="${section}">${userInfo}</div>`;
                    }
                } catch (error) {
                    console.error('Error processing roster row:', error);
                }
            });

            return `<div id="wms_roster_grid">${gridHTML}</div>`;
        };

        // Initialize section filtering functionality
        const initializeSectionFiltering = () => {
            try {
                const rosterGrid = document.querySelector('#wms_roster_grid');
                if (!rosterGrid) return;

                const gridUsers = document.querySelectorAll('#wms_roster_grid .wms_roster_user');
                if (gridUsers.length === 0) return;

                // Build section mapping from data attributes
                const sections = new Set();
                gridUsers.forEach(user => {
                    const section = user.dataset.section || 'No Section';
                    sections.add(section);
                });

                // Create sorted section array with 'All' option first
                const sectionArray = ['All', ...Array.from(sections).sort()];
                let currentSectionIndex = 0;

                // Create controls container
                let controlsDiv = document.querySelector('#wms_section_controls');
                if (!controlsDiv) {
                    controlsDiv = document.createElement('div');
                    controlsDiv.id = 'wms_section_controls';
                    controlsDiv.style.cssText = `
                        padding: 10px;
                        background: #f9f9f9;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        margin-bottom: 15px;
                        font-family: Arial, sans-serif;
                    `;
                    rosterGrid.parentNode.insertBefore(controlsDiv, rosterGrid);
                }

                // Format section name to exactly 25 characters
                const formatSectionName = (sectionName) => {
                    if (sectionName.length > 25) {
                        // Truncate long names and add ellipsis
                        return sectionName.substring(0, 22) + '...';
                    } else if (sectionName.length < 25) {
                        // Pad short names with spaces
                        return sectionName.padEnd(25, ' ');
                    }
                    return sectionName; // Exactly 25 characters
                };

                // Update display based on current section
                const updateSectionDisplay = () => {
                    const currentSection = sectionArray[currentSectionIndex];
                    const formattedSection = formatSectionName(currentSection);
                    let visibleCount = 0;

                    // Show/hide users based on section
                    gridUsers.forEach(user => {
                        const userSection = user.dataset.section || 'No Section';
                        if (currentSection === 'All' || userSection === currentSection) {
                            user.style.display = 'inline-block';
                            visibleCount++;
                        } else {
                            user.style.display = 'none';
                        }
                    });

                    // Update controls HTML with formatted section name
                    controlsDiv.innerHTML = `
                        <strong>Section Filter:</strong> <span style="color: #0078d4; font-weight: bold; font-family: monospace; white-space: pre;">${formattedSection}</span>
                        <button id='wms_prev_section' style='margin-left:15px; padding: 4px 12px; background: #0078d4; color: white; border: none; border-radius: 3px; cursor: pointer;'>← Prev</button>
                        <button id='wms_next_section' style='margin-left:5px; padding: 4px 12px; background: #0078d4; color: white; border: none; border-radius: 3px; cursor: pointer;'>Next →</button>
                        <button id='wms_all_sections' style='margin-left:15px; padding: 4px 12px; background: #28a745; color: white; border: none; border-radius: 3px; cursor: pointer;'>Show All</button>
                        <span style='margin-left:15px; color:#666; font-size: 0.9em;'>(${visibleCount} students)</span>
                    `;

                    // Attach event listeners with error handling
                    const prevBtn = document.querySelector('#wms_prev_section');
                    const nextBtn = document.querySelector('#wms_next_section');
                    const allBtn = document.querySelector('#wms_all_sections');

                    if (prevBtn) {
                        prevBtn.addEventListener('click', () => {
                            currentSectionIndex = (currentSectionIndex - 1 + sectionArray.length) % sectionArray.length;
                            updateSectionDisplay();
                        });
                    }

                    if (nextBtn) {
                        nextBtn.addEventListener('click', () => {
                            currentSectionIndex = (currentSectionIndex + 1) % sectionArray.length;
                            updateSectionDisplay();
                        });
                    }

                    if (allBtn) {
                        allBtn.addEventListener('click', () => {
                            currentSectionIndex = 0;
                            updateSectionDisplay();
                        });
                    }
                };

                // Initialize display
                updateSectionDisplay();

            } catch (error) {
                console.error('Error initializing section filtering:', error);
            }
        };

        // Modern implementation of randomize functionality
        const shuffleRosterGrid = () => {
            const grid = document.querySelector('#wms_roster_grid');
            if (!grid) return;

            const users = Array.from(grid.querySelectorAll('.wms_roster_user'));

            // Fisher-Yates shuffle algorithm
            for (let i = users.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [users[i], users[j]] = [users[j], users[i]];
            }

            // Re-append shuffled elements
            users.forEach(user => grid.appendChild(user));
        };

        // Initialize the feature
        observeAjaxCompletion();
    }

    /***********************************************
     ** Add Presenter View (zoom main div; hide all other columns)
     ***********************************************/

    /**
     * Scale a page using CSS3
     * @param {number} minWidth - The width of your wrapper or your page's minimum width
     */
    const scalePage = (minWidth) => {
        // Check parameters
        if (!minWidth || minWidth === '') {
            console.log('minWidth not defined. Exiting');
            return;
        }

        // Do not scale if a touch device is detected
        if (isTouchDevice()) {
            return;
        }

        // The wrapper container should be the parent element
        const parentElem = document.querySelector('#wrapper-container');
        if (!parentElem) return;

        // Wrap content to prevent long vertical scrollbars
        if (!document.querySelector('#resizer-boundary')) {
            parentElem.innerHTML = `<div id="resizer-boundary"><div id="resizer-supercontainer">${parentElem.innerHTML}</div></div>`;
        }

        const boundary = document.querySelector('#resizer-boundary');
        const superContainer = document.querySelector('#resizer-supercontainer');

        if (!boundary || !superContainer) return;

        // Get current dimensions of content
        let winW = window.innerWidth;
        const docH = parentElem.offsetHeight;

        const scalePageNow = () => {
            // Defining the width of 'supercontainer' ensures that content will be
            // centered when the window is wider than the original content
            superContainer.style.width = `${minWidth}px`;

            // Get the width of the window
            winW = window.innerWidth;

            const newWidth = winW / minWidth; // percentage
            const newHeight = (docH * (newWidth * minWidth)) / minWidth; // pixel

            const transformValue = `scale(${newWidth})`;

            superContainer.style.transform = transformValue;
            superContainer.style.transformOrigin = '0 0';
            superContainer.style.webkitTransform = transformValue;
            superContainer.style.webkitTransformOrigin = '0 0';
            superContainer.style.mozTransform = transformValue;
            superContainer.style.mozTransformOrigin = '0 0';
            superContainer.style.oTransform = transformValue;
            superContainer.style.oTransformOrigin = '0 0';
            superContainer.style.msTransform = transformValue;
            superContainer.style.msTransformOrigin = '0 0';

            boundary.style.position = 'relative';
            boundary.style.overflow = 'hidden';
            boundary.style.height = `${newHeight}px`;
        };

        scalePageNow();
        window.addEventListener('resize', scalePageNow);
    };

    const isTouchDevice = () => {
        return !!(('ontouchstart' in window) || window.navigator.maxTouchPoints);
    };

    // Add Presenter View functionality (excluding pages with LTI iframes)
    if (!window.location.href.match(/\/external_tools/i)) {
        const breadcrumbs = document.querySelector('NAV#breadcrumbs');
        if (breadcrumbs) {
            const presenterBreadcrumb = document.createElement('div');
            presenterBreadcrumb.id = 'wms_presenter_breadcrumb';
            presenterBreadcrumb.innerHTML = '<a href="#" class="btn btn-primary icon-none" title="Enable Presenter View">&nbsp;Presenter&nbsp;View</a>';
            breadcrumbs.insertAdjacentElement('afterend', presenterBreadcrumb);
        }

        const application = document.querySelector('#application');
        if (application) {
            const exitBtn = document.createElement('div');
            exitBtn.id = 'wms_presenter_exit_btn';
            exitBtn.innerHTML = '<div id="wms_presenter_exit_text" class="wmsPresenterRotate wmsDisplayNone" title="Exit Presenter View">Exit&nbsp;Presenter&nbsp;View</div>';
            application.insertBefore(exitBtn, application.firstChild);
        }
    }

    // Exit Presenter View: reload page
    const presenterExitBtn = document.querySelector('#wms_presenter_exit_btn');
    if (presenterExitBtn) {
        presenterExitBtn.addEventListener('click', () => {
            location.reload();
        });
    }

    // Enable Presenter View
    const presenterBreadcrumb = document.querySelector('#wms_presenter_breadcrumb');
    if (presenterBreadcrumb) {
        presenterBreadcrumb.addEventListener('click', (e) => {
            e.preventDefault();

            try {
                // Hide breadcrumb link and all unnecessary page elements
                const body = document.body;
                const elements = {
                    body,
                    presenterBreadcrumb,
                    header: document.querySelector('HEADER'),
                    toggleCrumbs: document.querySelector('.ic-app-nav-toggle-and-crumbs'),
                    leftSide: document.querySelector('#left-side'),
                    rightSide: document.querySelector('#right-side-wrapper'),
                    main: document.querySelector('#main'),
                    wrapper: document.querySelector('#wrapper-container'),
                    layout: document.querySelector('.ic-app-main-layout-horizontal'),
                    exitBtn: document.querySelector('#wms_presenter_exit_btn'),
                    exitText: document.querySelector('#wms_presenter_exit_text')
                };

                body?.classList.remove('course-menu-expanded');
                elements.presenterBreadcrumb?.classList.add('wmsDisplayNone');
                elements.header?.classList.add('wmsDisplayNone');
                elements.toggleCrumbs?.classList.add('wmsDisplayNone');
                elements.leftSide?.classList.add('wmsDisplayNone');
                elements.rightSide?.classList.add('wmsDisplayNone');

                if (elements.main) {
                    elements.main.classList.add('wmsMarginZero');
                    elements.main.style.cssText = 'padding-left: 25px; max-width: 900px !important;';
                }

                elements.wrapper?.classList.add('wmsMarginZero');
                elements.layout?.classList.add('wmsMarginZero');

                // Scale the page
                scalePage(900);

                // Show exit button
                elements.exitBtn?.classList.add('wmsPresenterExit');
                elements.exitText?.classList.remove('wmsDisplayNone');

            } catch (error) {
                console.error('Error enabling presenter view:', error);
            }
        });
    }

    /***********************************************
     ** Customize UI: LOGIN PAGE
     ***********************************************/
    const isLoginPage = window.location.href.match(/\/login\/ldap/i) ||
                       window.location.href.match(/\/login\/canvas/i) ||
                       window.location.href.match(/\/login/i);

    if (isLoginPage) {
        // Change title of page
        document.title = 'Glow';

        // Change labels/text
        const forgotPassword = document.querySelector('#login_forgot_password');
        if (forgotPassword) {
            forgotPassword.textContent = 'Forgot password?';
            forgotPassword.style.cssText = 'display: initial !important; float: right !important;';
        }

        const loginLinks = document.querySelectorAll('.ic-Login__link');
        loginLinks.forEach(link => {
            link.style.cssText = 'display: none !important;';
        });

        const labels = document.querySelectorAll('label.ic-Label');
        labels.forEach(label => {
            label.textContent = '';
        });

        // Add placeholder text to the username and password input fields
        const usernameInput = document.querySelector('#pseudonym_session_unique_id');
        if (usernameInput) {
            usernameInput.setAttribute('placeholder', 'username (e.g. aa1)');
        }

        const passwordInput = document.querySelector('#pseudonym_session_password');
        if (passwordInput) {
            passwordInput.setAttribute('placeholder', 'password');
        }

        const brokenImages = document.querySelectorAll('img.broken-image, img.hidden-readable');
        brokenImages.forEach(img => {
            img.alt = 'broken image';
        });

        const loginButton = document.querySelector('.Button--login');
        if (loginButton) {
            loginButton.style.cssText = 'position: absolute !important; right: 190px !important;';
        }

        // Custom footer links (only on login page)
        const loginBody = document.querySelector('div.ic-Login__body');
        if (loginBody) {
            const footerHTML = `
                <p id="wms-login-footer">
                    <a href="https://dean.williams.edu/policies/classroom-recordings-and-use-of-class-materials/" target="_blank" title="Williams policy on recording and distribution of course materials">Williams policy on recording and distribution of course materials</a><br />
                    <a href="https://oit.williams.edu/help-guides/glow-lms/glow/" target="_blank" title="Glow Help">Glow Help</a>
                </p>
            `;
            loginBody.insertAdjacentHTML('beforeend', footerHTML);
        }
    }

    /***********************************************
     ** Customize UI: SELF ENROLL (ALTERNATE LOGIN PAGE)
     ***********************************************/
    if (window.location.href.match(/\/enroll/i)) {
        const initialActionInput = document.querySelector('input[name=initial_action]');
        if (initialActionInput) {
            const prevP = initialActionInput.previousElementSibling;
            if (prevP && prevP.tagName === 'P') {
                prevP.textContent = "Please enter your Username (without '@williams.edu') and password:";
            }
        }

        const confirmationHeader = document.querySelector('HEADER.ic-Login-confirmation__header');
        if (confirmationHeader) {
            confirmationHeader.style.cssText = 'background-color: #333333 !important;';
        }

        const confirmationLogo = document.querySelector('IMG.ic-Login-confirmation__logo');
        if (confirmationLogo) {
            confirmationLogo.src = 'https://apps.williams.edu/glow/images/enroll-login.png';
            confirmationLogo.alt = 'Williams College - GLOW';
        }
    }

    /***********************************************
     ** Customize UI: INTERNAL PAGES
     ***********************************************/

    // Extend existing partial horizontal rule to boundary edges
    const toggleCrumbs = document.querySelector('DIV.ic-app-nav-toggle-and-crumbs');
    if (toggleCrumbs) {
        toggleCrumbs.classList.add('wmsBreadCrumbsLine');
    }

    const footer = document.querySelector('FOOTER.ic-app-footer');
    if (footer) {
        footer.classList.add('wmsFooterLine');
    }

    // Navigation: Add 'Williams Resources' to the account level
    const fifthMenuItem = document.querySelector('UL#menu li:nth-child(5)');
    if (fifthMenuItem) {
        const resourcesMenuItem = document.createElement('li');
        resourcesMenuItem.className = 'menu-item';
        resourcesMenuItem.innerHTML = `
            <a id="wms_resources_icon" href="/users/1234567/external_tools/481471" class="ic-app-header__menu-list-link">
                <div class="menu-item-icon-container" aria-hidden="true">
                    <img src="https://apps.williams.edu/glow/images/icon-williams-resources.png" alt="Williams Resources" title="Williams Resources" />
                </div>
                <div class="menu-item__text">Resources</div>
            </a>
        `;
        fifthMenuItem.insertAdjacentElement('afterend', resourcesMenuItem);
    }

    /***********************************************
     ** Add Google Analytics
     ***********************************************/
    try {
        // Modern Google Analytics implementation
        const gaScript = document.createElement('script');
        gaScript.async = true;
        gaScript.src = '//www.google-analytics.com/analytics.js';

        const firstScript = document.getElementsByTagName('script')[0];
        if (firstScript && firstScript.parentNode) {
            firstScript.parentNode.insertBefore(gaScript, firstScript);
        }

        window.GoogleAnalyticsObject = 'ga';
        window.ga = window.ga || function() {
            (window.ga.q = window.ga.q || []).push(arguments);
        };
        window.ga.l = 1 * new Date();

        window.ga('create', 'UA-10912569-3', 'auto');
        window.ga('send', 'pageview');

    } catch (error) {
        console.error('Error initializing Google Analytics:', error);
    }

}); // END OF: DOMContentLoaded event listener
