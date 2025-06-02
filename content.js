function logToUI(message) {
    const logBox = document.getElementById('gpt-ui-log');
    if (logBox) {
      const entry = document.createElement('div');
      entry.textContent = message;
      logBox.appendChild(entry);
    }
  }
  
  function generateWithGPT(promptText, callback) {
    chrome.runtime.sendMessage(
      { type: 'generate_text', prompt: `Write a helpful response to: "${promptText}"` },
      response => callback(response.reply)
    );
  }
  
  function getRandomOption(options) {
    return options[Math.floor(Math.random() * options.length)];
  }
  
  function handleRadioButton(radioGroup) {
    const options = Array.from(radioGroup.querySelectorAll('input[type="radio"]'));
    if (options.length > 0) {
      const randomOption = getRandomOption(options);
      randomOption.checked = true;
      randomOption.dispatchEvent(new Event('change', { bubbles: true }));
      logToUI(`✅ Selected radio option: "${randomOption.value}"`);
    }
  }
  
  function handleCustomerComponent(component) {
    // For shadcn customer components, we'll look for the select element
    const select = component.querySelector('select');
    if (select) {
      const options = Array.from(select.options).filter(opt => opt.value);
      if (options.length > 0) {
        const randomOption = getRandomOption(options);
        select.value = randomOption.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        logToUI(`✅ Selected customer option: "${randomOption.text}"`);
      }
    }
  }
  
  function handleRatingButtons(ratingGroup) {
    const buttons = Array.from(ratingGroup.querySelectorAll('button[aria-label^="Rate"]'));
    logToUI(`🔍 Found ${buttons.length} rating buttons in group`);
    
    if (buttons.length > 0) {
      const randomButton = getRandomOption(buttons);
      logToUI(`🎯 Attempting to click rating button: "${randomButton.getAttribute('aria-label')}"`);
      
      try {
        // First click to select the rating
        randomButton.click();
        
        // Update the SVG icon to show selected state
        const svg = randomButton.querySelector('svg');
        if (svg) {
          svg.classList.remove('text-gray-400');
          svg.classList.add('text-primary');
          // Also update the circle to be filled
          svg.innerHTML = '<circle cx="12" cy="12" r="10" fill="currentColor" stroke="currentColor" stroke-width="2"/>';
        }
        
        const ratingText = randomButton.querySelector('span')?.textContent || '';
        logToUI(`✅ Selected rating: "${ratingText}"`);
        
        // Dispatch change event to notify any listeners
        randomButton.dispatchEvent(new Event('change', { bubbles: true }));
        
      } catch (error) {
        logToUI(`❌ Error clicking rating button: ${error.message}`);
      }
    } else {
      logToUI('⚠️ No rating buttons found in group');
    }
  }
  
  function handleCommentSection(commentButton) {
    logToUI(`🔍 Comment button state: ${commentButton.getAttribute('data-state')}`);
    
    try {
      // Find the accordion trigger button that controls the comment section
      const accordionTrigger = commentButton.closest('.group')?.querySelector('button[aria-controls^="radix-"]');
      if (!accordionTrigger) {
        logToUI('⚠️ Could not find accordion trigger for comment section');
        return;
      }
      
      // Get the accordion content ID from the trigger
      const contentId = accordionTrigger.getAttribute('aria-controls');
      const commentSection = document.getElementById(contentId);
      
      if (!commentSection) {
        logToUI('⚠️ Could not find comment section element');
        return;
      }
      
      // If section is closed, click the trigger to open it
      if (commentSection.getAttribute('data-state') === 'closed') {
        accordionTrigger.click();
        logToUI('✅ Opened comment section');
        
        // Wait a bit for the animation to complete
        setTimeout(() => {
          // Try to find and fill the comment textarea
          const textarea = commentSection.querySelector('textarea');
          if (textarea) {
            logToUI('🔍 Found comment textarea, attempting to fill');
            generateWithGPT("Write a brief comment about this rating", generatedText => {
              textarea.value = generatedText;
              textarea.dispatchEvent(new Event('input', { bubbles: true }));
              logToUI(`✅ Filled comment: "${generatedText}"`);
            });
          } else {
            logToUI('⚠️ No textarea found in comment section');
          }
        }, 300);
      } else {
        logToUI('ℹ️ Comment section already open');
      }
      
      // Update the comment button state
      commentButton.setAttribute('data-state', 'on');
      commentButton.setAttribute('aria-pressed', 'true');
      
    } catch (error) {
      logToUI(`❌ Error handling comment section: ${error.message}`);
    }
  }
  
  function handleSkipCheckbox(skipCheckbox) {
    if (Math.random() < 0.3) { // 30% chance to skip
      skipCheckbox.click();
      logToUI('✅ Skipped this rating');
    }
  }
  
  function scanAndFillFields() {
    logToUI('🚀 Starting form scan...');
    
    // Handle text fields and textareas
    const fields = document.querySelectorAll('textarea, input[type="text"]');
    logToUI(`🔍 Found ${fields.length} text fields/areas`);
    
    fields.forEach(field => {
      const labelEl = field.closest('div')?.querySelector('label, .text-sm.font-medium');
      const labelText = labelEl?.innerText?.trim();
  
      if (labelText) {
        logToUI(`⏳ Generating for: "${labelText}"`);
        generateWithGPT(labelText, generatedText => {
          field.value = generatedText;
          field.dispatchEvent(new Event('input', { bubbles: true }));
          logToUI(`✅ Filled: "${generatedText}"`);
        });
      } else {
        logToUI('⚠️ Skipped field (no label)');
      }
    });
  
    // Handle rating groups
    const ratingGroups = document.querySelectorAll('.items-center.grid.w-full');
    logToUI(`🔍 Found ${ratingGroups.length} rating groups`);
    
    ratingGroups.forEach((group, index) => {
      const labelEl = group.closest('.group')?.querySelector('label');
      const labelText = labelEl?.innerText?.trim();
      
      if (labelText) {
        logToUI(`\n📋 Processing rating group ${index + 1}: "${labelText}"`);
        
        // Handle skip checkbox if present
        const skipCheckbox = group.closest('.group')?.querySelector('button[role="checkbox"]');
        if (skipCheckbox) {
          logToUI(`🔍 Found skip checkbox for "${labelText}"`);
          handleSkipCheckbox(skipCheckbox);
        } else {
          logToUI(`ℹ️ No skip checkbox found for "${labelText}"`);
        }
        
        // Handle rating buttons
        handleRatingButtons(group);
        
        // Handle comment button
        const commentButton = group.closest('.group')?.querySelector('button[aria-pressed]');
        if (commentButton) {
          logToUI(`🔍 Found comment button for "${labelText}"`);
          handleCommentSection(commentButton);
        } else {
          logToUI(`ℹ️ No comment button found for "${labelText}"`);
        }
      } else {
        logToUI(`⚠️ Rating group ${index + 1} has no label`);
      }
    });
    
    logToUI('\n✨ Form scan completed');
  }
  
  function createFloatingUI() {
    const container = document.createElement('div');
    container.id = 'gpt-ui-log';
    container.style.position = 'fixed';
    container.style.bottom = '10px';
    container.style.right = '10px';
    container.style.width = '300px';
    container.style.maxHeight = '300px';
    container.style.overflowY = 'auto';
    container.style.backgroundColor = '#fff';
    container.style.border = '1px solid #ccc';
    container.style.padding = '10px';
    container.style.zIndex = 99999;
    container.style.fontSize = '12px';
    container.style.fontFamily = 'monospace';
    container.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    container.innerHTML = '<strong>GPT Form Filler Log</strong><hr />';
    document.body.appendChild(container);
  }
  
  window.addEventListener('GPT_SCAN_TRIGGERED', () => {
    createFloatingUI();
    scanAndFillFields();
  });
  