class ConsumoMensal{
	constructor(mes, kwh, valor){
		this.mes = mes
		this.kwh = parseFloat(kwh)
		this.valor = parseFloat(valor)
		this.next = null
	}
}

class ListaEncadeada{
	constructor(){
		this.head = null
		this.size = 0
	}

	inserir(mes, kwh, valor){
		const novo = new ConsumoMensal(mes, kwh, valor)

		if(!this.head){
			this.head = novo
		} else {
			let atual = this.head
			while(atual.next) atual = atual.next
			atual.next = novo
		}

		this.size++
	}

	remover(idx){
		if(idx === 0){
			this.head = this.head.next
			this.size--
			return
		}

		let atual = this.head
		let i = 0
		while(atual && i < idx - 1){
			atual = atual.next
			i++
		}

		if(atual && atual.next){
			atual.next = atual.next.next
			this.size--
		}
	}

	toArray(){
		const arr = []
		let atual = this.head
		while(atual){
			arr.push(atual)
			atual = atual.next
		}
		return arr
	}

	totalKwh(){
		return this.toArray().reduce((soma, n) => soma + n.kwh, 0)
	}

	totalValor(){
		return this.toArray().reduce((soma, n) => soma + n.valor, 0)
	}
}

class NoDica{
	constructor(texto){
		this.texto = texto
		this.next = null
	}
}

class FilaEncadeada{
	constructor(){
		this.frente = null
		this.fim = null
		this.tamanho = 0
	}

	enqueue(texto){
		const no = new NoDica(texto)

		if(!this.fim){
			this.frente = no
			this.fim = no
		} else {
			this.fim.next = no
			this.fim = no
		}

		this.tamanho++
	}

	dequeue(){
		if(!this.frente) return null

		const removido = this.frente
		this.frente = this.frente.next
		if(!this.frente) this.fim = null

		this.tamanho--
		return removido.texto
	}

	peek(){
		if(!this.frente) return null
		return this.frente.texto
	}

	toArray(){
		const arr = []
		let atual = this.frente
		while(atual){
			arr.push(atual.texto)
			atual = atual.next
		}
		return arr
	}
}

class NoSimulacao{
	constructor(dados, horario){
		this.dados = dados
		this.horario = horario
		this.next = null
	}
}

class PilhaSimulacoes{
	constructor(){
		this.topo = null
		this.tamanho = 0
	}

	push(dados){
		const no = new NoSimulacao(dados, new Date().toLocaleTimeString("pt-BR"))
		no.next = this.topo
		this.topo = no
		this.tamanho++
	}

	pop(){
		if(!this.topo) return null

		const removido = this.topo
		this.topo = this.topo.next
		this.tamanho--
		return removido
	}

	toArray(){
		const arr = []
		let atual = this.topo
		while(atual){
			arr.push(atual)
			atual = atual.next
		}
		return arr
	}
}

class CalculadoraSolar{
	constructor(hsp, potPainel, custoPainel, tarifa){
		this.hsp = hsp
		this.potPainel = potPainel
		this.custoPainel = custoPainel
		this.tarifa = tarifa
	}

	calcular(lista){
		const meses = lista.size
		const kwhAnual = meses >= 12 ? lista.totalKwh() : lista.totalKwh() * (12 / Math.max(meses, 1))
		const kwhMedio = kwhAnual / 12

		const geracaoPainel = this.potPainel * this.hsp * 30 * 0.8
		const paineis = Math.ceil(kwhMedio / geracaoPainel)

		const investimento = paineis * this.custoPainel
		const economiaMensal = kwhMedio * this.tarifa
		const roi = investimento / (economiaMensal * 12)
		const co2Anual = (kwhAnual * 0.233) / 1000

		return {
			kwhMedio: Math.round(kwhMedio),
			paineis: paineis,
			investimento: Math.round(investimento),
			economiaMensal: Math.round(economiaMensal),
			roi: Math.round(roi * 10) / 10,
			co2Anual: Math.round(co2Anual * 100) / 100
		}
	}
}

class RelatorioSustentavel{
	constructor(dados, lista){
		this.dados = dados
		this.lista = lista
	}

	renderizar(){
		const d = this.dados
		const textoMeses = this.lista.size === 1 ? "mês" : "meses"

		return `
<div class="result-card">
  <div class="result-title">
    <svg width="16" height="16" fill="#085041" viewBox="0 0 24 24"><path d="M12 2L2 8l10 6 10-6-10-6zM2 14l10 6 10-6"/></svg>
    Relatório de Transição Energética
  </div>
  <div class="result-grid">
    <div class="result-item"><div class="rl">Painéis necessários</div><div class="rv">${d.paineis} painéis</div></div>
    <div class="result-item"><div class="rl">Investimento total</div><div class="rv">R$ ${d.investimento.toLocaleString("pt-BR")}</div></div>
    <div class="result-item"><div class="rl">Economia mensal</div><div class="rv">R$ ${d.economiaMensal.toLocaleString("pt-BR")}</div></div>
    <div class="result-item"><div class="rl">Retorno (anos)</div><div class="rv">${d.roi} anos</div></div>
    <div class="result-item" style="grid-column:1/-1">
      <div class="rl">CO₂ evitado por ano</div>
      <div class="rv">${d.co2Anual} toneladas</div>
      <div class="prog-bar"><div class="prog-fill" style="width:${Math.min(d.co2Anual * 20, 100)}%"></div></div>
    </div>
  </div>
</div>
<div style="margin-top:.75rem;padding:1rem;background:var(--surface);border-radius:8px;font-size:13px;color:var(--color-text-secondary);line-height:1.6">
  Cálculo baseado em ${this.lista.size} ${textoMeses} de consumo. Valores estimados a partir da irradiação solar média da região selecionada.
</div>`
	}
}

const lista = new ListaEncadeada()
const pilha = new PilhaSimulacoes()
const fila = new FilaEncadeada()
let grafico = null

const dicasIniciais = [
	"Energia solar pode reduzir sua conta em até 95%. Painéis têm vida útil média de 25-30 anos.",
	"Aparelhos em standby consomem até 12% da energia total da casa. Desligue da tomada!",
	"Lâmpadas LED consomem 75% menos energia que as incandescentes e duram 25x mais.",
	"Geladeiras antigas consomem 3x mais energia que modelos eficientes. Vale trocar!",
	"Lavar roupas com água fria economiza até 90% da energia do ciclo de lavagem.",
	"Sistemas solares reduzem emissão de ~0.23 kg de CO₂ por kWh gerado no Brasil.",
	"O Brasil tem potencial solar 30% maior que a Alemanha, líder mundial em energia solar.",
	"Uma família com 6 painéis solares evita ~2 toneladas de CO₂ por ano — equivale a 10 árvores."
]

dicasIniciais.forEach(texto => fila.enqueue(texto))

function adicionarConsumo(){
	const mesHtml = document.getElementById("inMes")
	const kwhHtml = document.getElementById("inKwh")
	const valHtml = document.getElementById("inVal")

	const valorMes = mesHtml.value.trim()
	const valorKwh = kwhHtml.value
	const valorVal = valHtml.value

	if(!valorMes || !valorKwh || !valorVal){
		alert("Preencha todos os campos.")
		return
	}

	lista.inserir(valorMes, valorKwh, valorVal)

	mesHtml.value = ""
	kwhHtml.value = ""
	valHtml.value = ""

	atualizarLista()
}

function limparLista(){
	while(lista.head) lista.remover(0)
	atualizarLista()
}

function atualizarLista(){
	const arr = lista.toArray()
	const ulHtml = document.getElementById("lista-nodes")

	if(!arr.length){
		ulHtml.innerHTML = `<li style="text-align:center;padding:1.5rem;color:var(--color-text-secondary);font-size:13px">Nenhum dado inserido ainda</li>`
		if(grafico){
			grafico.destroy()
			grafico = null
		}
		return
	}

	ulHtml.innerHTML = arr.map((n, i) => `
		<li class="node-item">
			<span class="node-dot"></span>
			<span>${n.mes} · ${n.kwh} kWh · R$ ${n.valor.toFixed(2)}</span>
			<button class="del" onclick="removerNo(${i})">✕</button>
		</li>`).join("")

	atualizarGrafico(arr)
}

function removerNo(idx){
	lista.remover(idx)
	atualizarLista()
}

function atualizarGrafico(arr){
	if(typeof Chart === "undefined") return

	const ctx = document.getElementById("consumoChart").getContext("2d")

	if(grafico) grafico.destroy()

	grafico = new Chart(ctx, {
		type: "bar",
		data: {
			labels: arr.map(n => n.mes),
			datasets: [{
				label: "kWh",
				data: arr.map(n => n.kwh),
				backgroundColor: "#9FE1CB",
				borderColor: "#1D9E75",
				borderWidth: 1.5,
				borderRadius: 4
			}]
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: { legend: { display: false } },
			scales: {
				x: { grid: { display: false }, ticks: { font: { size: 11 } } },
				y: { grid: { color: "rgba(0,0,0,.05)" }, ticks: { font: { size: 11 } } }
			}
		}
	})
}

function executarSimulacao(){
	const areaHtml = document.getElementById("resultArea")

	if(lista.size === 0){
		areaHtml.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--color-text-secondary);font-size:14px">Insira pelo menos um mês de consumo na aba "Consumo".</div>`
		return
	}

	const hsp = parseFloat(document.getElementById("hsp").value)
	const pot = parseFloat(document.getElementById("potPainel").value)
	const custo = parseFloat(document.getElementById("custoPainel").value)
	const tarifa = parseFloat(document.getElementById("tarifa").value)

	const calc = new CalculadoraSolar(hsp, pot, custo, tarifa)
	const dados = calc.calcular(lista)

	const relatorio = new RelatorioSustentavel(dados, lista)
	areaHtml.innerHTML = relatorio.renderizar()

	pilha.push({ ...dados, meses: lista.size })
	atualizarPilha()
}

function desempilharSimulacao(){
	pilha.pop()
	atualizarPilha()
}

function atualizarPilha(){
	const arr = pilha.toArray()
	const contHtml = document.getElementById("pilha-nodes")
	const botaoHtml = document.getElementById("popBtn")

	botaoHtml.disabled = pilha.tamanho === 0

	if(!arr.length){
		contHtml.innerHTML = `<div style="text-align:center;padding:1.25rem;color:var(--color-text-secondary);font-size:13px">Nenhuma simulação executada</div>`
		return
	}

	contHtml.innerHTML = arr.map((no, i) => {
		const rotulo = i === 0 ? "mais recente" : "#" + (pilha.tamanho - i)

		return `
		<div class="stack-frame ${i === 0 ? "top" : ""}" style="margin-bottom:6px">
			<div class="stack-frame-label">${rotulo}</div>
			<div class="stack-frame-body">
				${no.horario} · ${no.dados.paineis} painéis · R$ ${no.dados.investimento.toLocaleString("pt-BR")} · ROI ${no.dados.roi}a · ${no.dados.meses} mes(es)
			</div>
		</div>`
	}).join("")
}

function dequeue(){
	const atual = fila.dequeue()
	if(atual !== null) fila.enqueue(atual)
	renderFila()
}

function renderFila(){
	const arr = fila.toArray()
	const textoHtml = document.getElementById("tipText")
	const contadorHtml = document.getElementById("tipCounter")

	textoHtml.textContent = fila.peek() || "Nenhuma dica disponível."
	contadorHtml.textContent = `${arr.length} dicas`
}

function switchTab(i){
	document.querySelectorAll(".tab").forEach((t, j) => t.classList.toggle("active", i === j))
	document.querySelectorAll(".section").forEach((s, j) => s.classList.toggle("active", i === j))
}

renderFila()
