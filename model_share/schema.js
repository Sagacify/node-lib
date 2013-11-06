mongoose.Schema.prototype.getClientFormat = function(){
	var clientFormat = {doc:{tree:{}, virtuals:this.documentVirtuals, actions:this.documentActions}, collection:{virtuals:this.collectionVirtuals, actions:this.collectionActions}};
	var me = this;
	if(this.clientView){
		this.clientView.forEach(function(key){
			var value = me.formattedSchema._get(key);
			if(value)
				clientFormat.doc.tree._set(key, value);
		});
	}

	return clientFormat;
};