const Component = (
  data: { 
    tag: string, 
    template: string, 
  }) => {
    
  return (target: any) => {
    target.prototype.__defineGetter__('tag', () => {
      return data.tag;
    });

    target.prototype.__defineGetter__('template', () => {
      return data.template;
    });
   
  }
}

export {
  Component,
}