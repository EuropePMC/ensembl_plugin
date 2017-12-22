$(function() {
  $('.maybe_wrap').each(function() {
    var $el = $(this);
    $el.css('overflow','hidden');
    if(this.clientHeight != this.scrollHeight ||
       this.clientWidth != this.scrollWidth) {
      $el.addClass('was_wrapped');
    }
  });


  function draw_gene(canvas,location,text,colour) {  
    var ctx = canvas.getContext('2d')
    var line = function(ctx,x,y,w,h) {
      ctx.beginPath();
      ctx.moveTo(x+0.5,y+0.5);
      ctx.lineTo(x+w+0.5,y+h+0.5);
      ctx.closePath();
      ctx.stroke();
    };
    var arrow = function(ctx,x,y,s,d) {
      line(ctx,x,y,d*s,-s); 
      line(ctx,x,y,d*s,s);
    };
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#cccccc';
    var loc = location.split(/[:-]/);
    var chr = loc[0];
    var start = parseInt(loc[1]);
    var end = parseInt(loc[2]);
    var strand = parseInt(loc[3]);
    var len = end - start + 1;
    var size = parseInt('1'+new Array(len.toString().length+1).join('0'));
    var sstr = size.toString().replace(/000$/,'k').replace(/000k$/,'M') + 'b';
    var img_start = (end+start-size)/2;
    var bp_per_px = size*(12/10) / canvas.width;
    console.log(bp_per_px);
    var h = canvas.height;
    var step = size/10/bp_per_px;
    var step_start = (Math.floor(img_start/step)*step - img_start)/bp_per_px;
    for(var i=0;i<12;i++) {
      offset = step_start + step*i;
      line(ctx,offset,0,0,h);
      if(!(i%2)) {
        ctx.fillRect(offset,0,step,3);
      }
    }
    var gene_start = (start-img_start)/bp_per_px+canvas.width/12;
    ctx.fillStyle = colour;
    ctx.fillRect(gene_start,30,len/bp_per_px,6);
    ctx.font = '10px sans-serif';
    if(strand>0) { text = text + " >"; }
    else         { text = "< " + text; }
    ctx.fillText(text,gene_start,25);
    ctx.fillText(location,step_start+step*4+4,45);
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'black';
    ctx.lineWidth = 1;
    line(ctx,0,0,canvas.width,0);
    line(ctx,0,3,canvas.width,0);
    line(ctx,step_start+step*1,10,step*4,0);
    line(ctx,step_start+step*8,10,step*3,0);
    arrow(ctx,step_start+step*1,10,4,1);
    arrow(ctx,step_start+step*11,10,4,-1);
    ctx.fillText(sstr,step_start+step*6,15);
  }
  
  draw_gene($('.rhs_canvas canvas')[0],"1:100000-190000:-1","BRCA2","#ff0000");


});
