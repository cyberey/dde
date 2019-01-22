//James Wigglesworth
//Started: 6_23_17
//Updated: 6_29_17

function sind(theta){
	if(theta%180 == 0){
    	return 0
    }
	return Math.sin(theta*Math.PI/180)
}

module.exports.sind = sind

function cosd(theta){
	if((theta+90)%180 == 0){
    	return 0
    }
	return Math.cos(theta*Math.PI/180)
}

module.exports.cosd = cosd


function tand(theta){
	if((theta+90)%180 == 0){
    	return theta*Infinity
    }
	return Math.tan(theta*Math.PI/180)
}
module.exports.tand = tand

function asind(ratio){
	return Math.asin(ratio)*180/Math.PI
}

module.exports.asind = asind


function acosd(ratio){
	return Math.acos(ratio)*180/Math.PI
}

module.exports.acosd = acosd


function atand(ratio){
	return Math.atan(ratio)*180/Math.PI
}

module.exports.atand = atand


function atan2d(num1, num2){
	return Math.atan2(num1, num2)*180/Math.PI
}

module.exports.atan2d = atan2d



