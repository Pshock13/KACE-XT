// ==UserScript==
// @name         KACE XT
// @namespace    com.github.pshock13
// @version      20250314
// @description  Adds additional functionality to KACE
// @match        https://smyrna-kbox.smyrna.k12.de.us/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    // Find the main side navigation container list
    function createSidebar(techMapping) {
        const sideNavContainer = document.querySelector('.k-main-side-nav-container > ul');
        // Just let's us know in the console if the sidebar was found or not
        if (!sideNavContainer) {
            console.error('Side navigation container NOT found!');
            return;
        }else{
            console.log('Side navigation container found!')
        };

    // Create and style the sidebar
    const sidebar = document.createElement('li');
    sidebar.id = 'ticket-count';

    // Add a title to the sidebar
    const titleAnchor = document.createElement('a');
    const title = document.createElement('span');
    title.textContent = 'Ticket Counts';
    titleAnchor.classList.add("k-icon-help-desk-sidenav");
    titleAnchor.appendChild(title);
    sidebar.appendChild(titleAnchor);

    // Add the horizontal line under the title
    const hr = document.createElement('hr');
    hr.style.border = 'none';
    hr.style.borderTop = '1px solid #ccc';
    hr.style.margin = '10px 0';
    sidebar.appendChild(hr);

    // Add the tech names below the title
    const techListElement = document.createElement('ul');
    techListElement.classList.add('tech-list'); // Add class for easier styling
    techListElement.style.listStyleType = 'none'; // Remove bullet points
    techListElement.style.paddingLeft = '10px'; // Indent for readability

    Object.entries(techMapping).forEach(([ownerId, techName]) => {
        const techItem = document.createElement('li');
        const techLink = document.createElement('a');
        techLink.textContent = techName;
        techLink.href = `https://smyrna-kbox.smyrna.k12.de.us/userui/ticket_list.php?OWNER_ID=${ownerId}&QUEUE_ID=10`;
        techLink.target = '_self';

        techItem.appendChild(techLink);
        techListElement.appendChild(techItem);
    });

    // Add the sidebar to the side nav container
    sidebar.appendChild(techListElement);
    sideNavContainer.appendChild(sidebar);
    };

   // Function to fetch tech IDs and names and cache them
    function fetchAndCacheTechMapping() {
        const techDropdown = document.querySelector('#filter_menu_owner');
        if (!techDropdown) return null;

        const techList = techDropdown.querySelector('.dropdown-menu');
        if (!techList) return null;

        const techMapping = {};

        techList.querySelectorAll('li a.k-action').forEach(anchor => {
            const actionUrl = anchor.getAttribute('data-action');
            const ownerIdMatch = actionUrl.match(/OWNER_ID=(\d+)/);

            if (ownerIdMatch) {
                const ownerId = ownerIdMatch[1];
                const techName = anchor.textContent.trim();
                techMapping[ownerId] = techName;
            }
        });
        // console.log(techMapping)

        // Cache the tech mapping in localStorage
        localStorage.setItem('techMapping', JSON.stringify(techMapping));
        return techMapping;
    }


    // Add toggle functionality to hide/show tech names with MutationObserver
function addSidebarToggleListener() {
    const techList = document.querySelector('.tech-list');
    const toggleButton = document.querySelector('.k-main-side-nav-container ul li#ticket-count');

    // Check if the toggle button has appeared in the DOM
    if (toggleButton) {
        // console.log('Toggle button found');
        // console.log(toggleButton);
        // console.log(techList)


        // Add click event listener to toggle tech names
        toggleButton.addEventListener('click', () => {
            const techList = document.querySelector('.tech-list'); // Re-fetch techList inside the event
            if (techList) {
                console.log("Toggle clicked");
                techList.classList.toggle('collapsed');
            } else {
                console.warn("Tech list not found");
            }
        });
    }
}

    // Attempt to load techMapping from the page as it will be the most up-to-date info
    let techMapping = fetchAndCacheTechMapping();

    if (!techMapping) {
        // If we cannot load a tech list from the current page, go ahead and load the cached list.
        techMapping = JSON.parse(localStorage.getItem('techMapping'));
    }

    if (techMapping) {
        // If we have a valid techMapping, create the sidebar
        addCustomStyles(); // Add the custom CSS when creating the sidebar
        createSidebar(techMapping);
        addSidebarToggleListener(); // Call after creating the sidebar
    } else {
        console.error('Unable to retrieve tech information.');
    }


    // Insert 'Settings' option in the user menu
    // Find the user profile menu
    const userProfileMenu = document.querySelector('#user-profile-menu');
    if (!userProfileMenu) {
        console.error('User profile menu not found!');
        return;
    }

    // Create the new menu item
    const settingsMenuItem = document.createElement('li');
    settingsMenuItem.classList.add('dropdown-link', 'pull-left');
    // Add event listener to 'Settings' button
    settingsMenuItem.addEventListener('click', showSettingsModal);

    // Create the link for "Settings"
    const settingsLink = document.createElement('a');
    settingsLink.textContent = 'Settings';
    settingsLink.href = '#'; // Update this URL as needed
    settingsLink.classList.add('k-action');
    settingsLink.id = 'user_profile_settings';

    // Add the link to the menu item
    settingsMenuItem.appendChild(settingsLink);

    // Insert the new item in the middle of the menu
    const logOutItem = document.querySelector('#user_profile_LOGOUT').closest('li');
    userProfileMenu.insertBefore(settingsMenuItem, logOutItem);

    // Add modal HTML to the page (initially hidden)
    function addSettingsModal() {
        // Create modal container
        const modal = document.createElement('div');
        modal.id = 'settings-modal';
        modal.className = 'bootbox modal k-user-profile-dialog';
        modal.tabIndex = -1;
        modal.style.overflow = 'hidden';
        modal.style.display = 'none'; // Initially hidden
        modal.setAttribute('aria-hidden', 'true');

        // Create modal body
        const modalBody = document.createElement('div');
        modalBody.className = 'modal-body';

        // Create form
        const form = document.createElement('form');
        form.id = 'UserSettingsForm';
        form.name = 'UserSettingsForm';

        // Create section for header
        const section = document.createElement('section');
        const header = document.createElement('h2');
        header.textContent = 'Settings';
        section.appendChild(header);

        // Create footer
        const footer = document.createElement('footer');
        footer.className = 'pull-right';

        // Create update button
        const updateButton = document.createElement('button');
        updateButton.type = 'button';
        updateButton.className = 'k-btn-dark k-btn-update-user-profile';
        updateButton.textContent = 'Update';

        // Create cancel button
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.className = 'k-btn-link k-btn-cancel-user-profile';
        cancelButton.id = 'close-settings-modal';
        cancelButton.textContent = 'Close';

        // Append elements
        footer.appendChild(updateButton);
        footer.appendChild(cancelButton);
        form.appendChild(section);
        form.appendChild(footer);
        modalBody.appendChild(form);
        modal.appendChild(modalBody);
        document.body.appendChild(modal); // Append modal to body

        // Add event listener for close button
        cancelButton.addEventListener('click', closeSettingsModal);
    }

    // Function to close the modal
    function closeSettingsModal() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.style.display = 'none'; // Hide the modal
            modal.setAttribute('aria-hidden', 'true'); // Update aria attribute
        }
    }

    // Function to show modal
    function showSettingsModal() {
        document.getElementById('settings-modal').style.display = 'block';
    }

    addSettingsModal();

    // Insert CSS styles
    function addCustomStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #ticket-count {
                color: #000;
            }
            .tech-list.collapsed {
                display: none;
            }
            hr {
                border: none;
                border-top: 1px solid #ccc;
                margin: 10px 0;
            }
        `;
        document.head.appendChild(style);
    }

})();
