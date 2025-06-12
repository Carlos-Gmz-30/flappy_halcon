// FlappyHalcon - Videojuego Institucional UTEZ
// "Con esfuerzo y alas, se llega lejos en la UTEZ"

class FlappyHalconGame {
	constructor() {
		this.canvas = document.getElementById("gameCanvas")
		this.ctx = this.canvas.getContext("2d")

		// Estado del juego
		this.gameState = "menu" // menu, playing, gameOver
		this.score = 0
		this.level = 1
		this.lives = 3
		this.energy = 100

		// Configuración del halcón
		this.falcon = {
			x: 100,
			y: 300,
			width: 40,
			height: 30,
			velocity: 0,
			gravity: 0.5,
			jumpPower: -8,
			color: "#8B4513",
		}

		// Obstáculos y elementos del juego
		this.obstacles = []
		this.bonusItems = []
		this.particles = []

		// Configuración de nivel
		this.obstacleSpeed = 2
		this.obstacleSpawnRate = 120 // frames entre obstáculos
		this.frameCount = 0

		// Tipos de obstáculos temáticos UTEZ
		this.obstacleTypes = [
			{ type: "exam", color: "#FF4444", text: "📝", name: "Examen Sorpresa" },
			{ type: "phone", color: "#4444FF", text: "📱", name: "Distracción Móvil" },
			{ type: "party", color: "#FFAA00", text: "🍺", name: "Fiesta" },
			{ type: "ai", color: "#AA44FF", text: "🤖", name: "Tentación IA" },
			{ type: "docencia", color: "#199779", text: "🏢", name: "Docencia" },
		]

		// Tipos de bonus
		this.bonusTypes = [
			{ type: "motivation", color: "#FFD700", text: "⭐", name: "Motivación", effect: "score" },
			{ type: "learning", color: "#00FF00", text: "📚", name: "Aprendizaje", effect: "energy" },
			{ type: "life", color: "#FF69B4", text: "❤️", name: "Vida Extra", effect: "life" },
		]

                this.buttons = {
                        start: { x: this.canvas.width / 2 - 100, y: this.canvas.height / 2, width: 200, height: 40 },
                        instructions: { x: this.canvas.width / 2 - 100, y: this.canvas.height / 2 + 60, width: 200, height: 40 },
                        back: { x: this.canvas.width / 2 - 100, y: this.canvas.height - 70, width: 200, height: 40 },
                        restart: { x: this.canvas.width / 2 - 100, y: this.canvas.height / 2 + 60, width: 200, height: 40 },
                        mainMenu: { x: this.canvas.width / 2 - 100, y: this.canvas.height / 2 + 110, width: 200, height: 40 },
                }

                this.initializeEventListeners()
                this.showMainMenu()
                this.gameLoop()
        }

        initializeEventListeners() {
                // Controles del juego
                document.addEventListener("keydown", (e) => {
                        if (e.code === "Space") {
                                e.preventDefault()
                                this.handleJump()
                        }
                })

                this.canvas.addEventListener("click", (e) => {
                        this.handleCanvasClick(e)
                })
        }

        showMainMenu() {
                this.gameState = "menu"
                document.getElementById("gameHUD").classList.add("hidden")
        }

        showInstructions() {
                this.gameState = "instructions"
        }

        startGame() {
                this.gameState = "playing"
                this.resetGame()
                document.getElementById("gameHUD").classList.remove("hidden")
        }

	restartGame() {
		this.startGame()
	}

	resetGame() {
		this.score = 0
		this.level = 1
		this.lives = 3
		this.energy = 100
		this.falcon.x = 100
		this.falcon.y = 300
		this.falcon.velocity = 0
		this.obstacles = []
		this.bonusItems = []
		this.particles = []
		this.frameCount = 0
		this.obstacleSpeed = 2
		this.updateHUD()
	}

	handleJump() {
		if (this.gameState === "playing" && this.energy > 10) {
			this.falcon.velocity = this.falcon.jumpPower
			this.energy -= 5
			this.createParticles(this.falcon.x, this.falcon.y, "#199779")
		}
	}

        gameLoop() {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

                switch (this.gameState) {
                        case "menu":
                                this.renderMainMenu()
                                break
                        case "instructions":
                                this.renderInstructionsScreen()
                                break
                        case "playing":
                                this.update()
                                this.render()
                                break
                        case "gameOver":
                                this.renderGameOverScreen()
                                break
                }

                this.frameCount++
                requestAnimationFrame(() => this.gameLoop())
        }

	update() {
		// Actualizar halcón
		this.falcon.velocity += this.falcon.gravity
		this.falcon.y += this.falcon.velocity

		// Límites del canvas
		if (this.falcon.y < 0) this.falcon.y = 0
		if (this.falcon.y > this.canvas.height - this.falcon.height) {
			this.loseLife()
		}

		// Generar obstáculos
		if (this.frameCount % this.obstacleSpawnRate === 0) {
			this.createObstacle()
		}

		// Generar bonus ocasionalmente
		if (this.frameCount % (this.obstacleSpawnRate * 3) === 0 && Math.random() < 0.3) {
			this.createBonus()
		}

		// Actualizar obstáculos
		this.obstacles = this.obstacles.filter((obstacle) => {
			obstacle.x -= this.obstacleSpeed

			// Colisión con halcón
			if (this.checkCollision(this.falcon, obstacle)) {
				this.handleObstacleCollision(obstacle)
				return false
			}

			// Puntuación por pasar obstáculo
			if (!obstacle.passed && obstacle.x + obstacle.width < this.falcon.x) {
				obstacle.passed = true
				this.score += 10
				this.energy = Math.min(100, this.energy + 2)
			}

			return obstacle.x > -obstacle.width
		})

		// Actualizar bonus
		this.bonusItems = this.bonusItems.filter((bonus) => {
			bonus.x -= this.obstacleSpeed

			// Colisión con halcón
			if (this.checkCollision(this.falcon, bonus)) {
				this.handleBonusCollision(bonus)
				return false
			}

			return bonus.x > -bonus.width
		})

		// Actualizar partículas
		this.particles = this.particles.filter((particle) => {
			particle.x += particle.vx
			particle.y += particle.vy
			particle.life--
			return particle.life > 0
		})

		// Regenerar energía gradualmente
		this.energy = Math.min(100, this.energy + 0.1)

		// Actualizar nivel
		this.updateLevel()

		// Actualizar HUD
		this.updateHUD()
	}

	createObstacle() {
		const obstacleType = this.obstacleTypes[Math.floor(Math.random() * this.obstacleTypes.length)]
		const gapSize = 150 - this.level * 5 // Gap se reduce con el nivel
		const gapPosition = Math.random() * (this.canvas.height - gapSize - 100) + 50

		// Obstáculo superior
		this.obstacles.push({
			x: this.canvas.width,
			y: 0,
			width: 60,
			height: gapPosition,
			...obstacleType,
			passed: false,
		})

		// Obstáculo inferior
		this.obstacles.push({
			x: this.canvas.width,
			y: gapPosition + gapSize,
			width: 60,
			height: this.canvas.height - (gapPosition + gapSize),
			...obstacleType,
			passed: false,
		})
	}

	createBonus() {
		const bonusType = this.bonusTypes[Math.floor(Math.random() * this.bonusTypes.length)]
		this.bonusItems.push({
			x: this.canvas.width,
			y: Math.random() * (this.canvas.height - 100) + 50,
			width: 30,
			height: 30,
			...bonusType,
		})
	}

	createParticles(x, y, color) {
		for (let i = 0; i < 5; i++) {
			this.particles.push({
				x: x,
				y: y,
				vx: (Math.random() - 0.5) * 4,
				vy: (Math.random() - 0.5) * 4,
				color: color,
				life: 30,
			})
		}
	}

	checkCollision(rect1, rect2) {
		return (
			rect1.x < rect2.x + rect2.width &&
			rect1.x + rect1.width > rect2.x &&
			rect1.y < rect2.y + rect2.height &&
			rect1.y + rect1.height > rect2.y
		)
	}

	handleObstacleCollision(obstacle) {
		this.loseLife()
		this.createParticles(this.falcon.x, this.falcon.y, "#FF4444")
	}

	handleBonusCollision(bonus) {
		this.createParticles(bonus.x, bonus.y, bonus.color)

		switch (bonus.effect) {
			case "score":
				this.score += 50
				break
			case "energy":
				this.energy = Math.min(100, this.energy + 30)
				break
			case "life":
				this.lives = Math.min(5, this.lives + 1)
				break
		}
	}

	loseLife() {
		this.lives--
		this.falcon.y = 300
		this.falcon.velocity = 0

		if (this.lives <= 0) {
			this.gameOver()
		}
	}

	updateLevel() {
		const newLevel = Math.floor(this.score / 100) + 1
		if (newLevel > this.level && newLevel <= 10) {
			this.level = newLevel
			this.obstacleSpeed = 2 + this.level * 0.5
			this.obstacleSpawnRate = Math.max(60, 120 - this.level * 6)
		}
	}

	updateHUD() {
		document.getElementById("score").textContent = this.score
		document.getElementById("level").textContent = this.level
		document.getElementById("lives").textContent = this.lives
		document.getElementById("energyFill").style.width = this.energy + "%"
	}

        gameOver() {
                this.gameState = "gameOver"
                document.getElementById("gameHUD").classList.add("hidden")

                const messages = [
                        "¡El esfuerzo siempre da frutos en la UTEZ!",
                        "¡Cada intento te acerca más al éxito académico!",
                        "¡La perseverancia es clave en tu formación UTEZ!",
                        "¡Sigue volando alto, futuro profesionista!",
                        "¡El conocimiento se construye paso a paso!",
                ]
                this.motivationalMessage = messages[Math.floor(Math.random() * messages.length)]
        }

	render() {
		// Limpiar canvas
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

		// Fondo con edificios UTEZ
		this.renderBackground()

		// Renderizar halcón
		this.renderFalcon()

		// Renderizar obstáculos
		this.obstacles.forEach((obstacle) => this.renderObstacle(obstacle))

		// Renderizar bonus
		this.bonusItems.forEach((bonus) => this.renderBonus(bonus))

		// Renderizar partículas
		this.particles.forEach((particle) => this.renderParticle(particle))
	}

	renderBackground() {
		// Cielo degradado
		const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height)
		gradient.addColorStop(0, "#87CEEB")
		gradient.addColorStop(1, "#98FB98")
		this.ctx.fillStyle = gradient
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

		// Edificios UTEZ en el fondo
		this.ctx.fillStyle = "#199779"
		for (let i = 0; i < 5; i++) {
			const x = i * 200 - ((this.frameCount * 0.5) % 1000)
			this.ctx.fillRect(x, this.canvas.height - 100, 80, 100)
			this.ctx.fillStyle = "#093565"
			this.ctx.fillRect(x + 10, this.canvas.height - 90, 60, 20)
			this.ctx.fillStyle = "#199779"
		}
	}

	renderFalcon() {
		this.ctx.save()
		this.ctx.translate(this.falcon.x + this.falcon.width / 2, this.falcon.y + this.falcon.height / 2)

		// Rotación basada en velocidad
		const rotation = Math.max(-0.5, Math.min(0.5, this.falcon.velocity * 0.1))
		this.ctx.rotate(rotation)

		// Cuerpo del halcón
		this.ctx.fillStyle = "#8B4513"
		this.ctx.fillRect(-this.falcon.width / 2, -this.falcon.height / 2, this.falcon.width, this.falcon.height)

		// Alas
		this.ctx.fillStyle = "#654321"
		this.ctx.fillRect(-this.falcon.width / 2 - 10, -5, 15, 10)

		// Ojo
		this.ctx.fillStyle = "#000"
		this.ctx.fillRect(this.falcon.width / 4, -this.falcon.height / 4, 4, 4)

		// Pico
		this.ctx.fillStyle = "#FFA500"
		this.ctx.fillRect(this.falcon.width / 2, -2, 8, 4)

		this.ctx.restore()
	}

	renderObstacle(obstacle) {
		this.ctx.fillStyle = obstacle.color
		this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)

		// Borde
		this.ctx.strokeStyle = "#093565"
		this.ctx.lineWidth = 2
		this.ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)

		// Icono del obstáculo
		this.ctx.font = "20px Arial"
		this.ctx.fillStyle = "#FFF"
		this.ctx.textAlign = "center"
		this.ctx.fillText(obstacle.text, obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2 + 7)
	}

	renderBonus(bonus) {
		this.ctx.fillStyle = bonus.color
		this.ctx.fillRect(bonus.x, bonus.y, bonus.width, bonus.height)

		// Efecto de brillo
		this.ctx.shadowColor = bonus.color
		this.ctx.shadowBlur = 10
		this.ctx.font = "20px Arial"
		this.ctx.fillStyle = "#FFF"
		this.ctx.textAlign = "center"
		this.ctx.fillText(bonus.text, bonus.x + bonus.width / 2, bonus.y + bonus.height / 2 + 7)
		this.ctx.shadowBlur = 0
	}

        renderParticle(particle) {
                this.ctx.fillStyle = particle.color
                this.ctx.globalAlpha = particle.life / 30
                this.ctx.fillRect(particle.x, particle.y, 3, 3)
                this.ctx.globalAlpha = 1
        }

        renderMenuBackground() {
                const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height)
                gradient.addColorStop(0, "#093565")
                gradient.addColorStop(1, "#199779")
                this.ctx.fillStyle = gradient
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        }

        drawButton(btn, text) {
                this.ctx.fillStyle = "#199779"
                this.ctx.fillRect(btn.x, btn.y, btn.width, btn.height)
                this.ctx.strokeStyle = "#072a52"
                this.ctx.lineWidth = 2
                this.ctx.strokeRect(btn.x, btn.y, btn.width, btn.height)
                this.ctx.fillStyle = "#FFF"
                this.ctx.font = "20px Arial"
                this.ctx.textAlign = "center"
                this.ctx.textBaseline = "middle"
                this.ctx.fillText(text, btn.x + btn.width / 2, btn.y + btn.height / 2)
        }

        isInsideButton(x, y, btn) {
                return x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height
        }

        handleCanvasClick(e) {
                const rect = this.canvas.getBoundingClientRect()
                const x = e.clientX - rect.left
                const y = e.clientY - rect.top

                if (this.gameState === "menu") {
                        if (this.isInsideButton(x, y, this.buttons.start)) return this.startGame()
                        if (this.isInsideButton(x, y, this.buttons.instructions)) return this.showInstructions()
                } else if (this.gameState === "instructions") {
                        if (this.isInsideButton(x, y, this.buttons.back)) return this.showMainMenu()
                } else if (this.gameState === "gameOver") {
                        if (this.isInsideButton(x, y, this.buttons.restart)) return this.restartGame()
                        if (this.isInsideButton(x, y, this.buttons.mainMenu)) return this.showMainMenu()
                } else if (this.gameState === "playing") {
                        this.handleJump()
                }
        }

        renderMainMenu() {
                this.renderMenuBackground()
                this.ctx.fillStyle = "#FFF"
                this.ctx.font = "48px Arial"
                this.ctx.textAlign = "center"
                this.ctx.fillText("FlappyHalcon", this.canvas.width / 2, 150)
                this.ctx.font = "40px Arial"
                this.ctx.fillText("🦅", this.canvas.width / 2, 210)
                this.ctx.font = "18px Arial"
                this.ctx.fillText("\"Con esfuerzo y alas, se llega lejos en la UTEZ\"", this.canvas.width / 2, 250)
                this.drawButton(this.buttons.start, "Iniciar Juego")
                this.drawButton(this.buttons.instructions, "Instrucciones")
        }

        renderInstructionsScreen() {
                this.renderMenuBackground()
                this.ctx.fillStyle = "#FFF"
                this.ctx.font = "32px Arial"
                this.ctx.textAlign = "center"
                this.ctx.fillText("Instrucciones", this.canvas.width / 2, 80)
                this.ctx.font = "16px Arial"
                const lines = [
                        "Objetivo: Ayuda al Halc\u00f3n UTEZ a volar entre las 'Docencias' y superar los obst\u00e1culos acad\u00e9micos.",
                        "Controles: Presiona ESPACIO o clic para volar.",
                        "Vidas: Tienes 3 vidas iniciales.",
                        "Energ\u00eda: Consume energ\u00eda para volar m\u00e1s r\u00e1pido.",
                        "Obst\u00e1culos: Evita ex\u00e1menes sorpresa, distracciones y tentaciones.",
                        "Bonus: Recoge \u00edtems de motivaci\u00f3n y aprendizaje.",
                ]
                lines.forEach((line, i) => {
                        this.ctx.fillText(line, this.canvas.width / 2, 120 + i * 30)
                })
                this.drawButton(this.buttons.back, "Volver")
        }

        renderGameOverScreen() {
                this.renderMenuBackground()
                this.ctx.fillStyle = "#FFF"
                this.ctx.font = "40px Arial"
                this.ctx.textAlign = "center"
                this.ctx.fillText("\u00a1Fin del Juego!", this.canvas.width / 2, 150)
                this.ctx.font = "20px Arial"
                this.ctx.fillText(`Puntuaci\u00f3n Final: ${this.score}`, this.canvas.width / 2, 220)
                this.ctx.fillText(`Nivel Alcanzado: ${this.level}`, this.canvas.width / 2, 250)
                if (this.motivationalMessage) {
                        this.ctx.fillStyle = "#20b887"
                        this.ctx.fillText(this.motivationalMessage, this.canvas.width / 2, 300)
                        this.ctx.fillStyle = "#FFF"
                }
                this.drawButton(this.buttons.restart, "Intentar de Nuevo")
                this.drawButton(this.buttons.mainMenu, "Men\u00fa Principal")
        }
}

// Inicializar el juego cuando se carga la página
window.addEventListener("load", () => {
	new FlappyHalconGame()
})
