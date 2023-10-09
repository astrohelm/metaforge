mode := dev
container := container
environment = frontend
message = First commit
data = data
repo = workspace

search-strings:
	grep -Hrn '${search}' ${path}

replace:
	grep -rl '${replace}' ${path} | xargs sed -i 's/${replace}/${replacement}/g'

search:
	find ${path} -name '${search}' -not -path '*/node_modules/*'

git-init:
	git init
	git remote add origin git:@github.com:astrohelm/${repo}
	git branch -M main
	git commit -am ${message}
	git push origin main

git-commit:
	git commit -am ${message}

git-pull:
	git commit -am ${message}
	git pull origin main

git-push:
	git commit -am ${message}
	git push origin main

git-log:
	git log --graph --oneline --decorate

cert:
	@echo "Creating certificates"
	mkcert -install -key-file local.key.pem -cert-file local.cert.pem localhost admin.localhost msk.localhost spb.localhost dev.localhost

clean:
	rm -rf ./node_modules yarn.lock package-lock.json ./dist ./build

compose-build:
	@echo "Building ${mode}"
	docker-compose -f docker-compose.${mode}.yml build

compose-up:
	@echo "${mode} container initialized"
	docker-compose -f docker-compose.${mode}.yml up -d

compose-stop:
	@echo "Closing ${mode} container"
	docker-compose -f docker-compose.${mode}.yml stop

compose-down:
	@echo "Attempt to remove ${mode} container"
	docker-compose -f docker-compose.${mode}.yml down  --remove-orphans

docker-build:
	@echo "Building ${container} ${mode}"
	docker build . -f ./Dockerfile.${mode} -t ${container}

docker-up:
	@echo "${container} ${mode} initialized"
	docker run -d -p 3000:3000 -v `pwd`:/opt/app --name ${container} ${container}

docker-stop:
	@echo "Closing ${container}"
	docker stop ${container}

docker-clean:
	@echo "Cleaning docker"
	docker system prune -a
