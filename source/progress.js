
Gauge = Class.create();
Gauge.prototype = {
    //opening :  Math.PI/3,
    //beginRad : Math.PI/2 + Gauge.opening/2,
    //endRad :   Math.PI/2 - Gauge.opening/2,
    
    initialize: function(id, size, values, labels) {
        this.id = id;
        this.size = size;
        this.radius = size/2 - 5;
        this.labels = labels || [];
        this.values = values || [];
        
        this.opening = Math.PI/3;
        this.beginRad = Math.PI/2 + this.opening/2;
        this.endRad = Math.PI/2 - this.opening/2;
        this.tickRad = (Math.PI*2-this.opening)/24;
        
        this.div = document.getElementById(id);
        this.div.style.position = 'relative';

        this.canvas = document.createElement('canvas');
        this.canvas.setAttribute('width', size);
        this.canvas.setAttribute('height', size);
        
        this.lblValue = document.createElement('span');
        this.lblValue.setAttribute('style', "position: absolute; text-align:center;");
        this.lblValue.style.position = 'absolute';
        this.lblValue.style.textAlign='center';
        this.lblValue.style.top = Math.round(this.size * 0.75) + 'px';
        this.lblValue.style.width = this.size + 'px';

        this._createLabels();
        this.div.appendChild(this.lblValue);
        this.div.appendChild(this.canvas);

//        this.canvas.setStyle({'position':'relative'});
        this.canvas.style.position = 'relative';
        if (Prototype.Browser.IE) this.canvas = G_vmlCanvasManager.initElement(this.canvas);
        
        this.ctx = this.canvas.getContext("2d");
        this.value = 0;
        this.targetValue = 0;
        
    },
    setScale: function(values, labels) {
        this.labels = labels || [];
        this.values = values || [];
    },
    _createLabels: function() {
        var i;
        var lbls = new Array(6);
        for(i=1; i<6; i++) {
            var label = document.createElement('span');
            label.id = 'label_' + i;
            label.className='label';
            var r = this.beginRad + 4*i*this.tickRad;
            var dx = this.radius + (this.radius-20) * Math.cos(r);
            var dy = this.radius + (this.radius-20) * Math.sin(r);
            if (i==3)
                dx -= 15;
            else if (i==4)
                dx -= 30;
            else if (i==5)
                dx -= 30;
            label.style.top = dy;
            label.style.left = dx;
            lbls[i] = label;
            this.div.appendChild(lbls[i]);
        }
        lbls[3].style.textAlign='center';
        lbls[4].style.textAlign='right';
        lbls[5].style.textAlign='right';
    },
    _drawGauge: function() {
        
        var ctx = this.ctx;
        var radius = this.radius;
        
        ctx.save();
        ctx.translate(this.size/2, this.size/2);
        // inner shade
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = radius / 11;
        ctx.beginPath();
        ctx.arc(0, 0, radius - ctx.lineWidth/2, this.beginRad, this.endRad, false);
        ctx.stroke();
        
        // center 
        ctx.beginPath();
        ctx.arc(0, 0, radius / 10, 0, Math.PI*2, false);
        ctx.fill();

        // ticks
        ctx.save();
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;
        ctx.rotate(this.beginRad);    // beginning
        var i;
        for (i=1; i<24; i++) {
            ctx.rotate(this.tickRad);
            ctx.beginPath();
            ctx.moveTo(radius, 0);
            if (i%4==0) {
                // longer tick
                ctx.lineTo(radius-radius/10, 0);
            }
            else {
                // small tick
                ctx.lineTo(radius-radius/20, 0);
            }
            ctx.stroke();
        }
        ctx.restore();
        
        // outer circle
        ctx.strokeStyle = '#f78f1e';
        ctx.lineWidth = '2';
        ctx.beginPath();
        ctx.arc(0, 0, radius, this.beginRad, this.endRad, false);
        ctx.stroke();

        ctx.restore();
    },
    _drawPin: function () {
        var posRad = this.beginRad;
        var values = this.values;
        if (values.length == 7) {
            var idx = 1;
            while (idx < values.length-1 && values[idx] < this.value) { idx=idx+1; }
            // if the value is bigger than the largest one
            if (this.value < values[idx-1])
                posRad = this.beginRad;
            else if (this.value > values[idx])
                posRad = this.endRad;
            else {
                var posIdx = (this.value - values[idx-1]) / (values[idx] - values[idx-1]) + idx - 1;    // float
                posRad += posIdx * 4 * this.tickRad;
            }
        }
            
        var ctx = this.ctx;
        ctx.save();
        
        ctx.translate(this.size/2, this.size/2);
        ctx.rotate(posRad);
        ctx.fillStyle = '#f78f1e';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 2);
        ctx.lineTo(this.radius-5, 0);
        ctx.lineTo(0, -2);
        ctx.lineTo(0, 0);
        ctx.fill();
        
        ctx.restore();
    },
    _drawValue: function() {
        this.lblValue.innerHTML = Render.pktsBytes(Math.round(this.value*1000));
    },
    paint: function() {
        this._adjValue();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this._drawGauge();
        this._drawPin();
        this._drawValue();
    },
    _adjValue: function() {
        if (this.tid == 0) {
            this.value = this.targetValue;
            return;
        }
            
        if (this._valuePlan && this._valuePlan.length > 0)
            this.value = this._valuePlan.pop();
        else
            this.value = this.targetValue;
        
        this.value = parseFloat(this.value) + ((0.5-Math.random()) * 0.05 * this.value);
    },
    setValue: function(value) {
        this.targetValue = value;
        // create a plan for the value changes
        var percentages = [ 0.1, 0.2, 0.3, 0.4, 0.7, 0.8, 0.9, 0.95, 1 ];
        var curValue = this.value;
        this._valuePlan = percentages.map((function(p) {
            return curValue*p+ this.targetValue*(1-p);
        }).bind(this));
    },
    start: function() {
        this.setValue(0);
        this.tid = setInterval(this.paint.bind(this), 100);
    },
    stop: function() {
        clearInterval(this.tid);
        this.tid = 0;
        this.paint();
    }
};

Progress = Class.create();
Progress.prototype = {
    
    initialize: function(id, width, height, dir) {
        this.id = id;
        this.direction = dir || 1;
        
        this.div = document.getElementById(id);
        this.width = width;
        this.height = height;
        this.div.style.position = 'relative';

        this.canvas = document.createElement('canvas');
        this.canvas.setAttribute('width', this.width);
        this.canvas.setAttribute('height', this.height);
        this.canvas.style.position = 'relative';
        this.div.appendChild(this.canvas);
        if (Prototype.Browser.IE) this.canvas = G_vmlCanvasManager.initElement(this.canvas);
    },
    setValue: function(pt) {
        this.value = pt;
        this.paint();
    },
    setDirection: function(dir) {
        this.direction = dir;
        this.paint()
    },
    paint: function() {
        var ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.save();
        var spacing = this.width / 20;
        ctx.lineWidth = spacing * 0.5;
        for (i=0; i<20; i++) {
            // inner shade
            
            ctx.strokeStyle = (i*5 > this.value) ? '#ddd' : '#5d88b8';
            
            ctx.beginPath();
            var offsetx = -30 + i*spacing + spacing*.4;
            var offsety = this.height/2;
            if (this.direction > 0)
                ctx.arc(offsetx, offsety, 30, -Math.PI/8, Math.PI/8, false);
            else
                ctx.arc(this.width - offsetx, offsety, 30, Math.PI*7/8, Math.PI*9/8, false);
            ctx.stroke();
        }
        ctx.restore();
    }
    
};

