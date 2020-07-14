export const EmailGenerator = {
  addTemplates(templates) {
    templates.forEach((template) => {
      SSR.compileTemplate(template.name, Assets.getText(template.path));
    })
  },
  generateHtml(templateName, data) {
    let html = null;
    try {
      html = SSR.render(templateName, data);
    } catch (err) {
      console.log(`meteor-template-email: Unable to generate html for template. Error: ${err}`);
    }

    return html;
  }
};