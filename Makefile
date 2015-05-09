all:
	make -C atlas_hook
	make -C atlas_nodes
	make -C cpp/cv
	make -C cpp/sensor

clean:
	make clean -C atlas_hook
	make clean -C atlas_nodes
	make clean -C cpp/cv
	make clean -C cpp/sensor
.PHONY: all 
