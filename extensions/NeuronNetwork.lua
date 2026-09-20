server.hasIntroSkip = true
server.hasPoisonDisabled = true
function spawnCharacter(charName, x, y)
    local characterData = lookup(16, charName)
    local character = createObject(characterData)
    character:setPosition(x, y, 0)
    server.objectManager:addObject(character)
    return character
end

function giveStatusEffect(char, effect)
    char:addStatusEffectSelf(lookup(117, effect), AttackOrigin.UNKNOWN)
end
local magicalGirl = spawnCharacter(
    "MagicalGirl",
    server.map.absSizeX / 2,
    server.map.absSizeY / 2
)
giveStatusEffect(magicalGirl, "GhostIncorporeal")
local brain = {
    w_wander = 0.8,      
    w_avoid = 0.2,       
    learning_rate = 0.05 
}

local playerScores = {}
for i = 0, server.playersCount - 1 do
    playerScores[i] = 0
end
local onDamage = function(source, projectile, damage, data, origin)
    if source ~= nil and source.index ~= -1 then
        local pIndex = source.index
        if playerScores[pIndex] ~= nil then
            playerScores[pIndex] = playerScores[pIndex] + math.floor(damage / 100)
            log("Player " .. pIndex .. " dealt damage! Score: " .. playerScores[pIndex])
            brain.w_avoid = math.min(1.0, brain.w_avoid + (brain.learning_rate * 2))
            brain.w_wander = math.max(0.0, brain.w_wander - (brain.learning_rate * 2))
            log("NN Weights Updated (Damage) -> Avoid: " .. brain.w_avoid)
        end
    end
end

local damageCallback = createCallback("DamageEventListener", onDamage)
magicalGirl.takingDamageListeners:add(damageCallback)

local ai_targetX = magicalGirl.x
local ai_targetY = magicalGirl.y

function tick()
    giveStatusEffect(magicalGirl, "GhostIncorporeal")
    
    local avoidX, avoidY = 0, 0
    
    for i = 0, server.playersCount - 1 do
        local p = server:getClientInfo(i)
        if p ~= nil and p.objectId ~= nil then
            local dx = magicalGirl.x - p.x
            local dy = magicalGirl.y - p.y
            local dist = math.sqrt(dx*dx + dy*dy)
            
            if dist > 0 and dist < 1500 then
                avoidX = avoidX + (dx / dist)
                avoidY = avoidY + (dy / dist)
                if dist < 300 then
                    local char = server.objectManager:getObject(p.objectId)
                    if char ~= nil then
                        char:teleport(server.map.absSizeX / 2, server.map.absSizeY / 2, nil, nil, 0, 0)
                        
                        playerScores[i] = playerScores[i] + 10
                        log("Player " .. i .. " touched target! Total: " .. playerScores[i])
                        
                        brain.w_avoid = math.min(1.0, brain.w_avoid + brain.learning_rate)
                        brain.w_wander = math.max(0.0, brain.w_wander - brain.learning_rate)
                    end
                end
            end
        end
    end
    
    if server.tick % 40 == 0 then
        local angle = server:getRandomInt(0, 628) / 100
        local wander_dist = server:getRandomInt(600, 1500)
        ai_targetX = magicalGirl.x + math.cos(angle) * wander_dist
        ai_targetY = magicalGirl.y + math.sin(angle) * wander_dist
    end
    
    local moveX = (ai_targetX - magicalGirl.x) * brain.w_wander + (avoidX * 1000) * brain.w_avoid
    local moveY = (ai_targetY - magicalGirl.y) * brain.w_wander + (avoidY * 1000) * brain.w_avoid
    
    local newX = magicalGirl.x + moveX
    local newY = magicalGirl.y + moveY
    
    newX = math.max(300, math.min(server.map.absSizeX - 300, newX))
    newY = math.max(300, math.min(server.map.absSizeY - 300, newY))
    
    magicalGirl:moveTo(newX, newY, true, 1200, false, false)
end