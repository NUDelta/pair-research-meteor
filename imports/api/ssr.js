import { SpacebarsCompiler } from 'meteor/spacebars-compiler';
import { Blaze } from "meteor/blaze";

// from: https://forums.meteor.com/t/a-better-way-to-do-ssr-with-blaze-in-meteor-than-meteorhacks-ssr/55687
export const SSR = {
  render: (templateName, data) => {
    const renderFunc = (data)? Blaze.toHTMLWithData : Blaze.toHTML;
    const template = Blaze.Template[templateName];
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }
    else {
      return renderFunc(template, data);
    }
  },
  compileTemplate: (name, content) => {
    const renderfunc = eval(`(function(view) { return ${SpacebarsCompiler.compile(content)}(); })`);
    const template = new Blaze.Template(name, function() { return renderfunc(this); });
    Blaze.Template[name] = template;
    return template;
  }
};